import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';

export interface DcaParams {
    user: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    inAmountPerCycle: string;
    cycleSeconds: number;
}

export interface DcaOrderParams {
    inAmount: string;
    numberOfOrders: number;
    interval: number;
    minPrice?: number | null;
    maxPrice?: number | null;
    startAt?: number | null;
}

export interface DcaOrder {
    id: string;
    user: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    inAmountPerCycle: string;
    cycleSeconds: number;
    nextCycleAt: number;
    status: 'active' | 'closed' | 'cancelled';
    createdAt: number;
}

export class DcaService {
    private baseUrl = 'https://api.jup.ag/recurring/v1';
    private connection: Connection;

    constructor(endpoint: string) {
        this.connection = new Connection(endpoint, 'confirmed');
    }

    async createOrder(params: {
        user: string;
        inputMint: string;
        outputMint: string;
        inAmount: string;
        numberOfOrders: number;
        interval: number;
        referral?: string;
        feeBps?: number;
    }) {
        try {
            const response = await fetch(`${this.baseUrl}/createOrder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: params.user,
                    inputMint: params.inputMint,
                    outputMint: params.outputMint,
                    params: {
                        time: {
                            inAmount: params.inAmount,
                            numberOfOrders: params.numberOfOrders,
                            interval: params.interval,
                        },
                        // For DCA API, feeBps and referral are typically at the top level or within params
                        // Based on Jupiter practices, we'll try this structure:
                        feeBps: params.feeBps,
                        referral: params.referral
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `DCA API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating DCA order:', error);
            throw error;
        }
    }

    async getOrders(user: string): Promise<DcaOrder[]> {
        try {
            const response = await fetch(`${this.baseUrl}/getOrders?user=${user}`);

            if (!response.ok) {
                throw new Error(`DCA API error: ${response.status}`);
            }

            const data = await response.json();
            return data.orders || [];
        } catch (error) {
            console.error('Error fetching DCA orders:', error);
            return [];
        }
    }

    async cancelOrder(user: string, dca: string) {
        try {
            const response = await fetch(`${this.baseUrl}/cancelOrder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user,
                    dca,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `DCA API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error cancelling DCA order:', error);
            throw error;
        }
    }
}
