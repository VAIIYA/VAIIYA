// MongoDB Storage Service - Persistent storage for lottery data
// Uses MongoDB to store lottery data with proper connection pooling for Vercel

import client from './mongodb';

export interface LotteryData {
  currentRound: {
    id: string;
    roundNumber: number;
    potSize: number;
    totalTickets: number;
    endTime: number;
    status: 'active' | 'ended' | 'drawing';
  };
  tickets: Array<{
    id: string;
    walletAddress: string;
    roundId: string;
    timestamp: number;
    transactionSignature?: string;
  }>;
  winners: Array<{
    roundId: string;
    walletAddress: string;
    prizeAmount: number;
    timestamp: number;
    payoutTransactionSignature?: string;
  }>;
}

const DB_NAME = 'luckyhaus';
const COLLECTION_NAME = 'lottery';

export class MongoDBStorage {
  private async getCollection() {
    try {
      // MongoDB driver handles connection pooling automatically
      // connect() is safe to call multiple times - it reuses existing connections
      await client.connect();
      const db = client.db(DB_NAME);
      return db.collection<LotteryData>(COLLECTION_NAME);
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  async getData(): Promise<LotteryData | null> {
    try {
      const collection = await this.getCollection();
      const data = await collection.findOne({});
      return data;
    } catch (error) {
      console.error('Error fetching from MongoDB:', error);
      return null;
    }
  }

  async updateData(data: LotteryData): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      // Use upsert to create if doesn't exist, update if it does
      await collection.updateOne(
        {},
        { $set: data },
        { upsert: true }
      );
      console.log('✅ Updated lottery data in MongoDB');
      return true;
    } catch (error) {
      console.error('Error updating MongoDB:', error);
      return false;
    }
  }

  async addTicket(ticket: {
    id: string;
    walletAddress: string;
    roundId: string;
    timestamp: number;
    transactionSignature?: string;
  }, amount?: number): Promise<boolean> {
    try {
      console.log('📊 Getting current data from MongoDB...');
      const currentData = await this.getData();
      
      if (!currentData) {
        console.log('📝 No existing data found, creating initial lottery data...');
        // Create initial data if it doesn't exist
        const initialData: LotteryData = {
          currentRound: {
            id: 'round-1',
            roundNumber: 1,
            potSize: 0,
            totalTickets: 0,
            endTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
            status: 'active'
          },
          tickets: [],
          winners: []
        };
        initialData.tickets.push(ticket);
        initialData.currentRound.totalTickets = 1;
        initialData.currentRound.potSize = amount || 0.01;
        console.log('💾 Creating new document with initial data...');
        return await this.updateData(initialData);
      }

      console.log(`📝 Adding ticket to existing data (${currentData.tickets.length} existing tickets)...`);
      currentData.tickets.push(ticket);
      currentData.currentRound.totalTickets += 1;
      currentData.currentRound.potSize += amount || 0.01; // Use provided amount or default to 0.01
      console.log('💾 Updating MongoDB with new ticket...');
      return await this.updateData(currentData);
    } catch (error) {
      console.error('❌ Error adding ticket to MongoDB:', error);
      return false;
    }
  }

  async updateRound(roundData: {
    id: string;
    roundNumber: number;
    potSize: number;
    totalTickets: number;
    endTime: number;
    status: 'active' | 'ended' | 'drawing';
  }): Promise<boolean> {
    try {
      const currentData = await this.getData();
      if (!currentData) {
        // Create initial data if it doesn't exist
        const initialData: LotteryData = {
          currentRound: roundData,
          tickets: [],
          winners: []
        };
        return await this.updateData(initialData);
      }

      currentData.currentRound = roundData;
      return await this.updateData(currentData);
    } catch (error) {
      console.error('Error updating round:', error);
      return false;
    }
  }

  async getCurrentRound(): Promise<any> {
    try {
      const data = await this.getData();
      return data?.currentRound || null;
    } catch (error) {
      console.error('Error getting current round:', error);
      return null;
    }
  }

  async getUserTickets(walletAddress: string, roundId: string): Promise<any[]> {
    try {
      const data = await this.getData();
      if (!data) return [];

      return data.tickets.filter(
        ticket => ticket.walletAddress === walletAddress && ticket.roundId === roundId
      );
    } catch (error) {
      console.error('Error getting user tickets:', error);
      return [];
    }
  }
}

// Export singleton instance
export const mongodbStorage = new MongoDBStorage();

