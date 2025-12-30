import { WalletContextProvider } from '@/app/providers/WalletProvider';
import { ToastProvider } from '@/app/components/shared/ToastProvider';
import { ErrorBoundary } from '@/app/components/shared/ErrorBoundary';
import { validateEnvironment } from '@/app/lib/core-env';
import Script from 'next/script';

/**
 * VAIIYA Unified Apps Layout
 * 
 * Provides shared state and infrastructure for all sub-applications
 * including Wallet connection, Toast notifications, and Error Handling.
 */
export default function UnifiedAppsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Validate environment variables on server-side
    if (typeof window === 'undefined') {
        try {
            validateEnvironment();
        } catch (error) {
            console.error('Core Environment validation failed:', error);
        }
    }

    return (
        <>
            {/* 
        Jupiter Terminal Script 
        Included here so it's available for both Swap and other DeFi features 
      */}
            <Script
                src="https://plugin.jup.ag/plugin-v1.js"
                strategy="beforeInteractive"
                data-preload
                defer
            />

            <ErrorBoundary>
                <WalletContextProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </WalletContextProvider>
            </ErrorBoundary>
        </>
    );
}
