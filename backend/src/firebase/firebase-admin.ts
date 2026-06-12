import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if Firebase credentials are provided
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

export let isFirebaseConfigured = false;
let adminApp: admin.app.App | null = null;
export let db: any = null;
export let adminAuth: any = null;
export let bucket: any = null;

export function initializeFirebase() {
  if (projectId && clientEmail && privateKey && privateKey.trim() !== "") {
    try {
      const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
        storageBucket,
      });

      db = adminApp.firestore();
      adminAuth = adminApp.auth();
      bucket = adminApp.storage().bucket();
      isFirebaseConfigured = true;
      logger.info("Firebase Admin SDK successfully initialized.");
      console.log("FIREBASE_OK");
    } catch (error) {
      logger.error("Failed to initialize Firebase Admin SDK. Falling back to Mock Database.");
      logger.error(error instanceof Error ? error.message : String(error));
      setupMockDb();
    }
  } else {
    logger.warn("Firebase credentials missing or incomplete in environment variables. Running in MOCK DATABASE mode.");
    setupMockDb();
  }
}

// ==========================================
// MOCK DATABASE & AUTH IMPLEMENTATION
// ==========================================

const MOCK_DB_DIR = path.resolve(__dirname, "../../data");
const MOCK_DB_FILE = path.join(MOCK_DB_DIR, "mock-db.json");

// Helper to load/save JSON data
function loadMockDB(): Record<string, Record<string, any>> {
  try {
    if (!fs.existsSync(MOCK_DB_DIR)) {
      fs.mkdirSync(MOCK_DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(MOCK_DB_FILE)) {
      // Seed default collections
      const initialData = {
        users: {},
        companies: {},
        invoices: {},
        contracts: {},
        negotiations: {},
        buyers: {},
        analytics: {},
        auditLogs: {}
      };
      fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
      return initialData;
    }
    const raw = fs.readFileSync(MOCK_DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    logger.error("Error reading mock DB: " + err);
    return {};
  }
}

function saveMockDB(data: Record<string, Record<string, any>>) {
  try {
    if (!fs.existsSync(MOCK_DB_DIR)) {
      fs.mkdirSync(MOCK_DB_DIR, { recursive: true });
    }
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    logger.error("Error writing to mock DB: " + err);
  }
}

class MockDocSnapshot {
  constructor(public id: string, private dataObj: any) {}
  get exists() {
    return this.dataObj !== undefined;
  }
  data() {
    return this.dataObj ? { ...this.dataObj, id: this.id } : undefined;
  }
}

class MockQuerySnapshot {
  constructor(public docs: MockDocSnapshot[]) {}
  get size() {
    return this.docs.length;
  }
  get empty() {
    return this.docs.length === 0;
  }
  forEach(callback: (doc: MockDocSnapshot) => void) {
    this.docs.forEach(callback);
  }
}

class MockDocRef {
  constructor(private collectionName: string, private docId: string) {}

  get id() {
    return this.docId;
  }

  async get() {
    const dbData = loadMockDB();
    const col = dbData[this.collectionName] || {};
    const docData = col[this.docId];
    return new MockDocSnapshot(this.docId, docData);
  }

  async set(data: any, options?: { merge?: boolean }) {
    const dbData = loadMockDB();
    if (!dbData[this.collectionName]) dbData[this.collectionName] = {};

    const existing = dbData[this.collectionName][this.docId] || {};
    const updated = options?.merge ? { ...existing, ...data } : { ...data };
    
    // Ensure id matches docId
    updated.id = this.docId;
    if (!updated.createdAt) updated.createdAt = existing.createdAt || new Date().toISOString();
    updated.updatedAt = new Date().toISOString();

    dbData[this.collectionName][this.docId] = updated;
    saveMockDB(dbData);
    return this;
  }

  async update(data: any) {
    const dbData = loadMockDB();
    if (!dbData[this.collectionName] || !dbData[this.collectionName][this.docId]) {
      throw new Error(`Document ${this.docId} not found in ${this.collectionName}`);
    }
    const existing = dbData[this.collectionName][this.docId];
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    dbData[this.collectionName][this.docId] = updated;
    saveMockDB(dbData);
    return this;
  }

  async delete() {
    const dbData = loadMockDB();
    if (dbData[this.collectionName] && dbData[this.collectionName][this.docId]) {
      delete dbData[this.collectionName][this.docId];
      saveMockDB(dbData);
    }
    return this;
  }
}

class MockQuery {
  protected collectionName: string;
  protected filters: Array<{ field: string; op: string; value: any }> = [];
  protected sortField: string | null = null;
  protected sortDir: "asc" | "desc" = "asc";
  protected limitCount: number | null = null;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  where(field: string, op: string, value: any) {
    this.filters.push({ field, op, value });
    return this;
  }

  orderBy(field: string, direction: "asc" | "desc" = "asc") {
    this.sortField = field;
    this.sortDir = direction;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async get() {
    const dbData = loadMockDB();
    const col = dbData[this.collectionName] || {};
    let docsList = Object.keys(col).map(id => ({ id, ...col[id] }));

    // Apply where filters
    for (const f of this.filters) {
      docsList = docsList.filter(doc => {
        const docVal = doc[f.field];
        if (f.op === "==" || f.op === "equal") return docVal === f.value;
        if (f.op === "!=") return docVal !== f.value;
        if (f.op === ">") return docVal > f.value;
        if (f.op === ">=") return docVal >= f.value;
        if (f.op === "<") return docVal < f.value;
        if (f.op === "<=") return docVal <= f.value;
        if (f.op === "array-contains") return Array.isArray(docVal) && docVal.includes(f.value);
        return true;
      });
    }

    // Apply order by
    if (this.sortField) {
      const field = this.sortField;
      const dir = this.sortDir === "asc" ? 1 : -1;
      docsList.sort((a, b) => {
        if (a[field] < b[field]) return -1 * dir;
        if (a[field] > b[field]) return 1 * dir;
        return 0;
      });
    }

    // Apply limit
    if (this.limitCount !== null) {
      docsList = docsList.slice(0, this.limitCount);
    }

    const docSnapshots = docsList.map(doc => new MockDocSnapshot(doc.id, doc));
    return new MockQuerySnapshot(docSnapshots);
  }
}

class MockCollectionRef extends MockQuery {
  constructor(collectionName: string) {
    super(collectionName);
  }

  doc(id?: string) {
    const docId = id || Math.random().toString(36).substring(2, 15);
    return new MockDocRef(this.collectionName, docId);
  }

  async add(data: any) {
    const docId = Math.random().toString(36).substring(2, 15);
    const ref = new MockDocRef(this.collectionName, docId);
    await ref.set(data);
    return ref;
  }
}

class MockFirestore {
  collection(name: string) {
    // Normalize collection name to lowercase to prevent typos
    return new MockCollectionRef(name.toLowerCase());
  }
}

class MockAuth {
  async createUser(properties: admin.auth.CreateRequest) {
    const uid = properties.uid || Math.random().toString(36).substring(2, 15);
    const dbData = loadMockDB();
    if (!dbData.users) dbData.users = {};
    
    // Check if user already exists
    const users = Object.values(dbData.users);
    if (users.some((u: any) => u.email === properties.email)) {
      throw new Error("Email already registered in Mock Auth");
    }

    const newUser = {
      id: uid,
      uid,
      email: properties.email,
      name: properties.displayName || "Unknown User",
      role: "Company", // Default role
      createdAt: new Date().toISOString()
    };
    
    dbData.users[uid] = newUser;
    saveMockDB(dbData);
    return newUser;
  }

  async verifyIdToken(idToken: string) {
    if (idToken.startsWith("mock-token-")) {
      const uid = idToken.replace("mock-token-", "");
      const dbData = loadMockDB();
      const user = dbData.users?.[uid];
      if (user) {
        return { uid, email: user.email, name: user.name, role: user.role };
      }
      throw new Error("Invalid mock token: user not found");
    }

    if (idToken.startsWith("mock-google-token-")) {
      const email = idToken.replace("mock-google-token-", "");
      const uid = `mock-google-uid-${Buffer.from(email).toString("hex").substring(0, 10)}`;
      const name = email.split("@")[0];
      return { uid, email, name, role: "Company" };
    }

    if (idToken.includes(".")) {
      // Decode JWT without verification since the backend is running in Mock mode
      try {
        const decoded = jwt.decode(idToken) as any;
        if (decoded && decoded.sub) {
          logger.info(`MockAuth: Decoded real Google/Firebase token without verification: ${decoded.email}`);
          return {
            uid: decoded.sub,
            email: decoded.email || "",
            name: decoded.name || (decoded.email ? decoded.email.split("@")[0] : "Google User"),
            role: "Company"
          };
        }
      } catch (err) {
        logger.error("Failed to decode JWT in MockAuth: " + err);
      }
    }

    throw new Error("Invalid token format for Mock Auth");
  }
}

class MockBucket {
  private bucketName: string;
  constructor(name: string) {
    this.bucketName = name;
  }
  file(fileName: string) {
    const destPath = path.resolve(MOCK_DB_DIR, "storage", fileName);
    return {
      name: fileName,
      save: async (buffer: Buffer, options: any) => {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, buffer);
        logger.info(`Mock File Saved: ${destPath}`);
      },
      getSignedUrl: async (config: any) => {
        // Return a mock local URL
        const apiPort = process.env.PORT || 8080;
        const apiHost = process.env.API_URL || `http://127.0.0.1:${apiPort}`;
        return [`${apiHost}/api/mock-storage/${fileName}`];
      },
      delete: async () => {
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath);
        }
        return true;
      }
    };
  }
}

class MockStorage {
  bucket() {
    return new MockBucket(process.env.FIREBASE_STORAGE_BUCKET || "mock-bucket");
  }
}

export function setupMockDb() {
  db = new MockFirestore();
  adminAuth = new MockAuth();
  bucket = new MockBucket(process.env.FIREBASE_STORAGE_BUCKET || "mock-bucket");
}

// Initialize mock DB by default
setupMockDb();
