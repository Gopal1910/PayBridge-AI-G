import { db } from "../firebase/firebase-admin.js";
import { NotFoundError } from "../utils/errors.js";
import logger from "../utils/logger.js";

export interface Buyer {
  id: string;
  name: string;
  score: number;
  history: string[];
  createdAt: string;
}

export class BuyerService {
  
  /**
   * Register a new buyer.
   */
  public static async create(data: {
    name: string;
    score?: number;
    history?: string[];
  }): Promise<Buyer> {
    logger.info(`BuyerService: Registering buyer "${data.name}"`);
    
    const id = Math.random().toString(36).substring(2, 15);
    const buyer: Buyer = {
      id,
      name: data.name,
      score: data.score !== undefined ? data.score : 80,
      history: data.history || ["Account created"],
      createdAt: new Date().toISOString()
    };

    await db.collection("buyers").doc(id).set(buyer);
    return buyer;
  }

  /**
   * List all registered buyers.
   */
  public static async list(): Promise<Buyer[]> {
    logger.info("BuyerService: Retrieving all buyers");
    const snapshot = await db.collection("buyers").get();
    const buyers: Buyer[] = [];
    
    snapshot.forEach((doc: any) => {
      buyers.push(doc.data() as Buyer);
    });

    return buyers;
  }

  /**
   * Retrieve a buyer credit profile.
   */
  public static async get(id: string): Promise<Buyer> {
    logger.info(`BuyerService: Fetching buyer ${id}`);
    const doc = await db.collection("buyers").doc(id).get();
    if (!doc.exists) {
      throw new NotFoundError("Buyer not found.");
    }
    return doc.data() as Buyer;
  }

  /**
   * Update details of a buyer (e.g. credit score or repayment logs).
   */
  public static async update(id: string, data: Partial<Omit<Buyer, "id" | "createdAt">>): Promise<Buyer> {
    logger.info(`BuyerService: Updating buyer ${id}`);
    const ref = db.collection("buyers").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      throw new NotFoundError("Buyer not found.");
    }
    const existing = doc.data() as Buyer;
    
    let updatedHistory = existing.history;
    if (data.history) {
      updatedHistory = [...existing.history, ...data.history];
    }

    const updated = {
      ...data,
      history: updatedHistory
    };

    await ref.update(updated);
    return { ...existing, ...updated };
  }
}
