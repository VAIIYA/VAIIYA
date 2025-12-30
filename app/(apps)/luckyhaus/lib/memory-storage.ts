// Temporary in-memory storage for when GitHub Gist is not available
// This ensures the lottery app works even without environment variables

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

class MemoryStorage {
  private data: LotteryData | null = null;

  async getData(): Promise<LotteryData | null> {
    return this.data;
  }

  async updateData(newData: LotteryData): Promise<boolean> {
    try {
      this.data = newData;
      console.log('💾 Updated in-memory storage:', {
        roundId: newData.currentRound.id,
        potSize: newData.currentRound.potSize,
        totalTickets: newData.currentRound.totalTickets,
        ticketsCount: newData.tickets.length,
        winnersCount: newData.winners.length
      });
      return true;
    } catch (error) {
      console.error('Error updating in-memory storage:', error);
      return false;
    }
  }

  async getCurrentRound() {
    return this.data?.currentRound || null;
  }

  async addTicket(ticket: {
    id: string;
    walletAddress: string;
    roundId: string;
    timestamp: number;
    transactionSignature?: string;
  }, amount?: number): Promise<boolean> {
    try {
      if (!this.data) {
        // Create initial data
        const now = new Date();
        const amsterdamTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Amsterdam"}));
        const roundDate = amsterdamTime.toISOString().split('T')[0];
        const roundId = `round-${roundDate}`;
        
        this.data = {
          currentRound: {
            id: roundId,
            roundNumber: 1,
            potSize: 0,
            totalTickets: 0,
            endTime: Date.now() + (24 * 60 * 60 * 1000),
            status: 'active'
          },
          tickets: [],
          winners: []
        };
      }

      this.data.tickets.push(ticket);
      this.data.currentRound.totalTickets += 1;
      this.data.currentRound.potSize += amount || 0.01; // Use provided amount or default to 0.01
      
      console.log('🎫 Added ticket to in-memory storage:', {
        ticketId: ticket.id,
        wallet: ticket.walletAddress,
        totalTickets: this.data.currentRound.totalTickets,
        potSize: this.data.currentRound.potSize
      });
      
      return true;
    } catch (error) {
      console.error('Error adding ticket to in-memory storage:', error);
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
      if (!this.data) {
        this.data = {
          currentRound: roundData,
          tickets: [],
          winners: []
        };
      } else {
        this.data.currentRound = roundData;
      }
      
      console.log('📊 Updated round in in-memory storage:', roundData);
      return true;
    } catch (error) {
      console.error('Error updating round in in-memory storage:', error);
      return false;
    }
  }
}

export const memoryStorage = new MemoryStorage();
