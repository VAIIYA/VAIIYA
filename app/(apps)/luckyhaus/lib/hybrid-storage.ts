// Hybrid Storage Service - MongoDB as primary, GitHub Gist as backup
// Implements dual-write pattern for redundancy and fallback read capability

import { mongodbStorage } from './mongodb-storage';
import { githubGistStorage } from './github-gist-storage';

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

export class HybridStorage {
  /**
   * Get data - MongoDB first, fallback to GitHub Gist
   */
  async getData(): Promise<LotteryData | null> {
    try {
      // Try MongoDB first (primary)
      const mongoData = await mongodbStorage.getData();
      if (mongoData) {
        console.log('✅ Data retrieved from MongoDB (primary)');
        return mongoData;
      }
      
      // Fallback to GitHub Gist if MongoDB is empty
      console.log('⚠️ MongoDB returned no data, trying GitHub Gist backup...');
      const gistData = await githubGistStorage.getData();
      if (gistData) {
        console.log('✅ Data retrieved from GitHub Gist (backup)');
        // Optionally sync back to MongoDB if we got data from Gist
        // This helps recover if MongoDB was temporarily unavailable
        try {
          await mongodbStorage.updateData(gistData);
          console.log('✅ Synced data from GitHub Gist back to MongoDB');
        } catch (syncError) {
          console.warn('⚠️ Failed to sync data from Gist to MongoDB:', syncError);
        }
        return gistData;
      }
      
      console.log('❌ No data found in either MongoDB or GitHub Gist');
      return null;
    } catch (error) {
      console.error('❌ Error in hybrid storage getData:', error);
      // Try GitHub Gist as last resort
      try {
        const gistData = await githubGistStorage.getData();
        if (gistData) {
          console.log('✅ Fallback to GitHub Gist succeeded');
          return gistData;
        }
      } catch (gistError) {
        console.error('❌ GitHub Gist fallback also failed:', gistError);
      }
      return null;
    }
  }

  /**
   * Update data - Write to both MongoDB and GitHub Gist (dual-write)
   */
  async updateData(data: LotteryData): Promise<boolean> {
    let mongoSuccess = false;
    let gistSuccess = false;

    // Write to MongoDB (primary)
    try {
      mongoSuccess = await mongodbStorage.updateData(data);
      if (mongoSuccess) {
        console.log('✅ Data written to MongoDB (primary)');
      }
    } catch (error) {
      console.error('❌ Failed to write to MongoDB:', error);
    }

    // Write to GitHub Gist (backup)
    try {
      gistSuccess = await githubGistStorage.updateData(data);
      if (gistSuccess) {
        console.log('✅ Data written to GitHub Gist (backup)');
      }
    } catch (error) {
      console.error('❌ Failed to write to GitHub Gist:', error);
    }

    // Return true if at least MongoDB succeeded (primary requirement)
    if (mongoSuccess) {
      if (!gistSuccess) {
        console.warn('⚠️ MongoDB write succeeded but GitHub Gist write failed - data is safe in MongoDB');
      }
      return true;
    }

    // If MongoDB failed but Gist succeeded, we still have the data
    if (gistSuccess) {
      console.warn('⚠️ MongoDB write failed but GitHub Gist write succeeded - data is safe in backup');
      return true;
    }

    // Both failed
    console.error('❌ Both MongoDB and GitHub Gist writes failed');
    return false;
  }

  /**
   * Add ticket - Write to both storages
   */
  async addTicket(
    ticket: {
      id: string;
      walletAddress: string;
      roundId: string;
      timestamp: number;
      transactionSignature?: string;
    },
    amount?: number
  ): Promise<boolean> {
    let mongoSuccess = false;
    let gistSuccess = false;

    // Write to MongoDB (primary)
    try {
      mongoSuccess = await mongodbStorage.addTicket(ticket, amount);
      if (mongoSuccess) {
        console.log('✅ Ticket added to MongoDB (primary)');
      }
    } catch (error) {
      console.error('❌ Failed to add ticket to MongoDB:', error);
    }

    // Write to GitHub Gist (backup)
    try {
      gistSuccess = await githubGistStorage.addTicket(ticket, amount);
      if (gistSuccess) {
        console.log('✅ Ticket added to GitHub Gist (backup)');
      }
    } catch (error) {
      console.error('❌ Failed to add ticket to GitHub Gist:', error);
    }

    // Return true if at least MongoDB succeeded
    if (mongoSuccess) {
      if (!gistSuccess) {
        console.warn('⚠️ MongoDB write succeeded but GitHub Gist write failed');
      }
      return true;
    }

    // If MongoDB failed but Gist succeeded
    if (gistSuccess) {
      console.warn('⚠️ MongoDB write failed but GitHub Gist write succeeded');
      return true;
    }

    console.error('❌ Both MongoDB and GitHub Gist writes failed');
    return false;
  }

  /**
   * Update round - Write to both storages
   */
  async updateRound(roundData: {
    id: string;
    roundNumber: number;
    potSize: number;
    totalTickets: number;
    endTime: number;
    status: 'active' | 'ended' | 'drawing';
  }): Promise<boolean> {
    let mongoSuccess = false;
    let gistSuccess = false;

    // Write to MongoDB (primary)
    try {
      mongoSuccess = await mongodbStorage.updateRound(roundData);
      if (mongoSuccess) {
        console.log('✅ Round updated in MongoDB (primary)');
      }
    } catch (error) {
      console.error('❌ Failed to update round in MongoDB:', error);
    }

    // Write to GitHub Gist (backup)
    try {
      gistSuccess = await githubGistStorage.updateRound(roundData);
      if (gistSuccess) {
        console.log('✅ Round updated in GitHub Gist (backup)');
      }
    } catch (error) {
      console.error('❌ Failed to update round in GitHub Gist:', error);
    }

    // Return true if at least MongoDB succeeded
    if (mongoSuccess) {
      if (!gistSuccess) {
        console.warn('⚠️ MongoDB write succeeded but GitHub Gist write failed');
      }
      return true;
    }

    // If MongoDB failed but Gist succeeded
    if (gistSuccess) {
      console.warn('⚠️ MongoDB write failed but GitHub Gist write succeeded');
      return true;
    }

    console.error('❌ Both MongoDB and GitHub Gist writes failed');
    return false;
  }

  /**
   * Get current round - MongoDB first, fallback to GitHub Gist
   */
  async getCurrentRound(): Promise<any> {
    try {
      // Try MongoDB first
      const mongoRound = await mongodbStorage.getCurrentRound();
      if (mongoRound) {
        return mongoRound;
      }

      // Fallback to GitHub Gist
      const gistRound = await githubGistStorage.getCurrentRound();
      if (gistRound) {
        console.log('✅ Current round retrieved from GitHub Gist (backup)');
        return gistRound;
      }

      return null;
    } catch (error) {
      console.error('❌ Error getting current round:', error);
      // Try GitHub Gist as last resort
      try {
        return await githubGistStorage.getCurrentRound();
      } catch (gistError) {
        console.error('❌ GitHub Gist fallback also failed:', gistError);
        return null;
      }
    }
  }

  /**
   * Get user tickets - MongoDB first, fallback to GitHub Gist
   */
  async getUserTickets(walletAddress: string, roundId: string): Promise<any[]> {
    try {
      // Try MongoDB first
      const mongoTickets = await mongodbStorage.getUserTickets(walletAddress, roundId);
      if (mongoTickets && mongoTickets.length > 0) {
        return mongoTickets;
      }

      // Fallback to GitHub Gist
      const gistTickets = await githubGistStorage.getUserTickets(walletAddress, roundId);
      if (gistTickets && gistTickets.length > 0) {
        console.log('✅ User tickets retrieved from GitHub Gist (backup)');
        return gistTickets;
      }

      return [];
    } catch (error) {
      console.error('❌ Error getting user tickets:', error);
      // Try GitHub Gist as last resort
      try {
        return await githubGistStorage.getUserTickets(walletAddress, roundId);
      } catch (gistError) {
        console.error('❌ GitHub Gist fallback also failed:', gistError);
        return [];
      }
    }
  }
}

// Export singleton instance
export const hybridStorage = new HybridStorage();

