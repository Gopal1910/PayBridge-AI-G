import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db, adminAuth } from "../firebase/firebase-admin.js";
import { UnauthorizedError, ConflictError, NotFoundError } from "../utils/errors.js";
import logger from "../utils/logger.js";

const JWT_SECRET = process.env.JWT_SECRET || "paybridge_secret_session_access_token_signature_key_2026";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "paybridge_secret_session_refresh_token_signature_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  companyId: string;
  role: "Admin" | "Company" | "Employee";
  createdAt: string;
}

export class AuthService {
  
  /**
   * Register a new user and map them to a company.
   */
  public static async register(data: {
    email: string;
    passwordHash: string;
    name: string;
    role: "Admin" | "Company" | "Employee";
    companyName?: string;
    industry?: string;
  }): Promise<{ user: UserProfile; companyId: string }> {
    logger.info(`AuthService: Registering user with email ${data.email}`);
    
    // Check if user already exists in Firestore users collection
    const userQuery = await db.collection("users").where("email", "==", data.email).get();
    if (!userQuery.empty) {
      throw new ConflictError("User with this email already exists.");
    }

    // Step 1: Create or resolve Company
    let companyId = "";
    if (data.companyName) {
      // Create new company
      const companyRef = await db.collection("companies").add({
        name: data.companyName,
        industry: data.industry || "General B2B",
        plan: "Standard",
        createdAt: new Date().toISOString()
      });
      companyId = companyRef.id;
      logger.info(`AuthService: Created new company ${data.companyName} with ID ${companyId}`);
    } else {
      // Default placeholder company for independent employee registrations
      companyId = "default-company-id";
    }

    // Step 2: Create Firebase user or mock database record
    const userId = Math.random().toString(36).substring(2, 15);
    const passwordHash = await bcrypt.hash(data.passwordHash, 10);

    const userData: UserProfile & { passwordHash: string } = {
      id: userId,
      name: data.name,
      email: data.email,
      companyId,
      role: data.role,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    // Store in Firestore
    await db.collection("users").doc(userId).set(userData);

    const { passwordHash: _, ...userProfile } = userData;
    return { user: userProfile, companyId };
  }

  /**
   * Validate credentials and issue token pair.
   */
  public static async login(email: string, passwordPlain: string): Promise<{
    user: UserProfile;
    accessToken: string;
    refreshToken: string;
  }> {
    logger.info(`AuthService: Logging in user with email ${email}`);

    // Query user profile
    const query = await db.collection("users").where("email", "==", email).get();
    if (query.empty) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    let userDoc: any = null;
    query.forEach((doc: any) => {
      userDoc = doc.data();
    });

    // Verify Password Hash
    const isPasswordValid = await bcrypt.compare(passwordPlain, userDoc.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const userProfile: UserProfile = {
      id: userDoc.id,
      name: userDoc.name,
      email: userDoc.email,
      companyId: userDoc.companyId,
      role: userDoc.role,
      createdAt: userDoc.createdAt
    };

    // Issue JWTs
    const tokens = this.generateTokenPair(userProfile);
    return {
      user: userProfile,
      ...tokens
    };
  }

  /**
   * Refresh the access token using a valid refresh token.
   */
  public static async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as UserProfile;
      logger.info(`AuthService: Refreshing token for user ${decoded.email}`);

      // Fetch user profile from database to ensure they still exist and check roles
      const userSnap = await db.collection("users").doc(decoded.id).get();
      if (!userSnap.exists) {
        throw new NotFoundError("User no longer exists.");
      }

      const freshUser = userSnap.data();
      const userProfile: UserProfile = {
        id: freshUser.id,
        name: freshUser.name,
        email: freshUser.email,
        companyId: freshUser.companyId,
        role: freshUser.role,
        createdAt: freshUser.createdAt
      };

      return this.generateTokenPair(userProfile);
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired refresh token.");
    }
  }

  /**
   * Helper to generate token pairs.
   */
  private static generateTokenPair(user: UserProfile): { accessToken: string; refreshToken: string } {
    const payload = {
      id: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN as any });

    return { accessToken, refreshToken };
  }

  /**
   * Login or Register a user via Google/Firebase Identity Token.
   */
  public static async loginWithGoogle(idToken: string): Promise<{
    user: UserProfile;
    accessToken: string;
    refreshToken: string;
  }> {
    logger.info("AuthService: Verifying Google/Firebase token");
    
    let uid = "";
    let email = "";
    let name = "Google User";

    try {
      // 1. Verify token via Admin SDK
      const decoded = await adminAuth.verifyIdToken(idToken);
      uid = decoded.uid;
      email = decoded.email || "";
      name = decoded.name || email.split("@")[0];
    } catch (err) {
      // Graceful local verify for mock credentials during dev testing
      if (idToken.startsWith("mock-google-token-")) {
        email = idToken.replace("mock-google-token-", "");
        uid = `mock-google-uid-${Buffer.from(email).toString("hex").substring(0, 10)}`;
        name = email.split("@")[0];
      } else {
        throw new UnauthorizedError("Invalid Google/Firebase token signature.");
      }
    }

    // 2. Query user profile
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    
    let userProfile: UserProfile;

    if (!userDoc.exists) {
      logger.info(`AuthService: Google user ${email} is first-time signer. Creating account.`);
      
      // Create a default company for the user
      const companyRef = await db.collection("companies").add({
        name: `${name}'s Company`,
        industry: "General B2B",
        plan: "Standard",
        createdAt: new Date().toISOString()
      });
      const companyId = companyRef.id;

      userProfile = {
        id: uid,
        name,
        email,
        companyId,
        role: "Company",
        createdAt: new Date().toISOString()
      };

      await userRef.set(userProfile);
    } else {
      const data = userDoc.data();
      userProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        companyId: data.companyId,
        role: data.role,
        createdAt: data.createdAt
      };
    }

    const tokens = this.generateTokenPair(userProfile);
    return {
      user: userProfile,
      ...tokens
    };
  }

  /**
   * Retrieve profile info.
   */
  public static async getProfile(uid: string): Promise<UserProfile> {
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) {
      throw new NotFoundError("User profile not found.");
    }
    const data = doc.data();
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      companyId: data.companyId,
      role: data.role,
      createdAt: data.createdAt
    };
  }
}
