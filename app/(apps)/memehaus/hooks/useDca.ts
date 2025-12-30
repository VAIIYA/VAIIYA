import { useState, useCallback, useMemo, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { DcaService, DcaOrder } from '../services/dcaService';
import { PriceService } from '../services/priceService';
import { VersionedTransaction } from '@solana/web3.js';
import { SwapToken } from './useSwap';
import { getEnvConfig } from '@/app/lib/core-env';

export interface DcaState {
    fromToken: SwapToken | null;
    toToken: SwapToken | null;
    totalAmount: string;
    numberOfOrders: number;
    interval: number; // in seconds
    orders: DcaOrder[];
    loading: boolean;
    error: string | null;
}

export const useDca = () => {
    const { connected, publicKey, signTransaction } = useWallet();
    const { connection } = useConnection();

    const [dcaState, setDcaState] = useState<DcaState>({
        fromToken: null,
        toToken: null,
        totalAmount: '',
        numberOfOrders: 10,
        interval: 86400, // Daily (1 day in seconds)
        orders: [],
        loading: false,
        error: null
    });

    const dcaService = useMemo(() => new DcaService(connection.rpcEndpoint), [connection.rpcEndpoint]);
    const priceService = useMemo(() => new PriceService(), []);

    const loadOrders = useCallback(async () => {
        if (!publicKey) return;
        try {
            setDcaState(prev => ({ ...prev, loading: true }));
            const orders = await dcaService.getOrders(publicKey.toString());
            setDcaState(prev => ({ ...prev, orders, loading: false }));
        } catch (error) {
            console.error('Error loading DCA orders:', error);
            setDcaState(prev => ({ ...prev, loading: false }));
        }
    }, [publicKey, dcaService]);

    const createOrder = useCallback(async () => {
        if (!connected || !publicKey || !signTransaction || !dcaState.fromToken || !dcaState.toToken || !dcaState.totalAmount) {
            return { success: false, error: 'Wallet not connected or missing parameters' };
        }

        // Validate minimum per order (1 USDC)
        const totalAmountNum = parseFloat(dcaState.totalAmount);
        const amountPerOrder = totalAmountNum / dcaState.numberOfOrders;
        const valuePerOrderUsdc = amountPerOrder * dcaState.fromToken.price;

        if (valuePerOrderUsdc < 1) {
            return { success: false, error: `Minimum order value must be at least 1 USDC. Current: ${valuePerOrderUsdc.toFixed(2)} USDC` };
        }

        try {
            setDcaState(prev => ({ ...prev, loading: true, error: null }));

            const inAmount = (totalAmountNum * Math.pow(10, dcaState.fromToken.decimals)).toString();

            const config = getEnvConfig();
            const serverWallet = config.serverWallet;
            const devWallets = [config.devWalletSn, config.devWalletMg].filter(Boolean);

            const rand = Math.random();
            let referral: string | undefined;

            if (rand < 0.5) {
                referral = serverWallet;
            } else {
                const devIdx = Math.floor((rand - 0.5) * 4);
                referral = devWallets[devIdx] || serverWallet;
            }

            const { transaction: serializedTransaction } = await dcaService.createOrder({
                user: publicKey.toString(),
                inputMint: dcaState.fromToken.mint,
                outputMint: dcaState.toToken.mint,
                inAmount,
                numberOfOrders: dcaState.numberOfOrders,
                interval: dcaState.interval,
                feeBps: 20, // 0.2% integrator fee
                referral
            });

            const transaction = VersionedTransaction.deserialize(Buffer.from(serializedTransaction, 'base64'));
            const signedTransaction = await signTransaction(transaction);

            const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
                skipPreflight: false,
                preflightCommitment: 'confirmed'
            });

            await connection.confirmTransaction(signature, 'confirmed');

            await loadOrders();
            setDcaState(prev => ({ ...prev, totalAmount: '', loading: false }));

            return { success: true, signature };
        } catch (error) {
            console.error('Error creating DCA order:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setDcaState(prev => ({ ...prev, loading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, [connected, publicKey, signTransaction, dcaState, dcaService, connection, loadOrders]);

    const cancelOrder = useCallback(async (dcaId: string) => {
        if (!publicKey || !signTransaction) return;
        try {
            setDcaState(prev => ({ ...prev, loading: true }));

            const { transaction: serializedTransaction } = await dcaService.cancelOrder(
                publicKey.toString(),
                dcaId
            );

            const transaction = VersionedTransaction.deserialize(Buffer.from(serializedTransaction, 'base64'));
            const signedTransaction = await signTransaction(transaction);

            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
            await connection.confirmTransaction(signature, 'confirmed');

            await loadOrders();
            setDcaState(prev => ({ ...prev, loading: false }));
        } catch (error) {
            console.error('Error cancelling DCA order:', error);
            setDcaState(prev => ({ ...prev, loading: false }));
        }
    }, [publicKey, signTransaction, dcaService, connection, loadOrders]);

    useEffect(() => {
        if (connected && publicKey) {
            loadOrders();
        } else {
            setDcaState(prev => ({ ...prev, orders: [] }));
        }
    }, [connected, publicKey, loadOrders]);

    return {
        dcaState,
        setDcaState,
        createOrder,
        cancelOrder,
        loadOrders
    };
};
