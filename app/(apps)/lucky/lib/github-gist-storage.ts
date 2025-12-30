// GitHub Gist Storage Service - Completely Free Alternative to Vercel Blob
// Uses GitHub Gists API to store lottery data
// No rate limits for public gists, completely free

const GITHUB_API_URL = 'https://api.github.com';
// Use a fixed Gist ID for persistence across deployments
const GIST_ID = process.env.LOTTERY_GIST_ID || 'lottery-data-storage-fixed-id';

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

export class GitHubGistStorage {
  private gistId: string;
  private githubToken: string;

  constructor(gistId?: string) {
    this.gistId = gistId || GIST_ID;
    this.githubToken = process.env.GITHUB_TOKEN || '';
    
    if (!this.githubToken) {
      console.error('❌ GITHUB_TOKEN environment variable is not set');
    }
    if (!this.gistId || this.gistId === 'lottery-data-storage-fixed-id') {
      console.warn('⚠️ LOTTERY_GIST_ID environment variable is not set - using fallback storage');
    }
  }

  async createGist(data: LotteryData): Promise<string> {
    try {
      const response = await fetch(`${GITHUB_API_URL}/gists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${this.githubToken}`,
          'User-Agent': 'LuckyHaus-Lottery',
        },
        body: JSON.stringify({
          description: 'LuckyHaus Lottery Data Storage',
          public: true,
          files: {
            'lottery-data.json': {
              content: JSON.stringify(data, null, 2)
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create gist: ${response.statusText}`);
      }

      const result = await response.json();
      this.gistId = result.id;
      return this.gistId;
    } catch (error) {
      console.error('Error creating GitHub Gist:', error);
      throw error;
    }
  }


  async getData(): Promise<LotteryData | null> {
    try {
      // If no GitHub token, return null to trigger fallback
      if (!this.githubToken) {
        console.log('GitHub Gist Storage - No token configured, using fallback');
        return null;
      }

      // If no Gist ID, return null to trigger fallback
      if (!this.gistId) {
        console.log('GitHub Gist Storage - No Gist ID configured, using fallback');
        return null;
      }

      const response = await fetch(`${GITHUB_API_URL}/gists/${this.gistId}`, {
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'User-Agent': 'LuckyHaus-Lottery',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Gist doesn't exist yet
        }
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.files['lottery-data.json']?.content;
      
      if (!content) {
        return null;
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Error fetching from GitHub Gist:', error);
      return null;
    }
  }

  async updateData(data: LotteryData): Promise<boolean> {
    try {
      const response = await fetch(`${GITHUB_API_URL}/gists/${this.gistId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${this.githubToken}`,
          'User-Agent': 'LuckyHaus-Lottery',
        },
        body: JSON.stringify({
          description: 'LuckyHaus Lottery Data Storage',
          files: {
            'lottery-data.json': {
              content: JSON.stringify(data, null, 2)
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update data: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating GitHub Gist:', error);
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
      console.log('📊 Getting current data from GitHub Gist...');
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
        console.log('💾 Creating new Gist with initial data...');
        return await this.updateData(initialData);
      }

      console.log(`📝 Adding ticket to existing data (${currentData.tickets.length} existing tickets)...`);
      currentData.tickets.push(ticket);
      currentData.currentRound.totalTickets += 1;
      currentData.currentRound.potSize += amount || 0.01; // Use provided amount or default to 0.01
      console.log('💾 Updating Gist with new ticket...');
      return await this.updateData(currentData);
    } catch (error) {
      console.error('❌ Error adding ticket to GitHub Gist:', error);
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

  async getGistUrl(): Promise<string> {
    return `https://gist.github.com/${this.gistId}`;
  }
}

// Export singleton instance
export const githubGistStorage = new GitHubGistStorage();
