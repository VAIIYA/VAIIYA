/**
 * Test utilities for MemeHaus application
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProvider } from '../contexts/AppContext';
import { WalletContextProvider } from '../providers/WalletProvider';

type JestShim = {
  fn: (...args: any[]) => any;
};

const createFallbackMock = (impl?: (...args: any[]) => any) => {
  let implementation = impl;
  const fallback: any = (...args: any[]) => {
    if (implementation) {
      return implementation(...args);
    }
    return undefined;
  };
  fallback.mockResolvedValue = (value: any) => {
    implementation = () => Promise.resolve(value);
    return fallback;
  };
  fallback.mockRejectedValue = (value: any) => {
    implementation = () => Promise.reject(value);
    return fallback;
  };
  fallback.mockReturnValue = (value: any) => {
    implementation = () => value;
    return fallback;
  };
  fallback.mockImplementation = (newImpl: (...args: any[]) => any) => {
    implementation = newImpl;
    return fallback;
  };
  return fallback;
};

const jestShim: JestShim = (globalThis as any).jest ?? {
  fn: (...args: any[]) => createFallbackMock(args[0]),
};

// Mock wallet adapter
const mockWallet = {
  publicKey: null,
  connected: false,
  connecting: false,
  disconnecting: false,
  wallet: null,
  wallets: [],
  select: jestShim.fn(),
  connect: jestShim.fn(),
  disconnect: jestShim.fn(),
  signTransaction: jestShim.fn(),
  signAllTransactions: jestShim.fn(),
};

// Mock connection
const mockConnection = {
  rpcEndpoint: 'https://api.mainnet-beta.solana.com',
  getBalance: jestShim.fn(),
  getAccountInfo: jestShim.fn(),
  getLatestBlockhash: jestShim.fn(),
  sendTransaction: jestShim.fn(),
  confirmTransaction: jestShim.fn(),
};

// Custom render function with providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppProvider>
      <WalletContextProvider>
        {children}
      </WalletContextProvider>
    </AppProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data generators
export const mockTokenData = {
  name: 'Test Token',
  symbol: 'TEST',
  description: 'A test token for testing purposes',
  totalSupply: '1000000000',
  initialPrice: '0.0001',
  vestingPeriod: '12',
  communityFee: '10',
  socialLinks: {
    twitter: 'testuser',
    telegram: 'testuser',
    website: 'https://test.com',
  },
};

export const mockLaunchItem = {
  name: 'Test Token',
  symbol: 'TEST',
  totalSupply: '1,000,000,000',
  communityDistribution: '0',
  distributionRecipients: 0,
  timeSinceLaunch: '1h',
  creatorWallet: 'testwallet.sol',
};

export const mockPlatformStats = {
  totalTokens: 100,
  totalVolume: '1,000,000',
  totalUsers: 50,
};

// Mock API responses
export const mockApiResponses = {
  tokens: {
    success: true,
    tokens: [mockLaunchItem],
    stats: mockPlatformStats,
    pagination: {
      page: 0,
      limit: 10,
      total: 1,
    },
  },
  error: {
    success: false,
    error: 'Test error message',
    tokens: [],
    stats: {
      totalTokens: 0,
      totalVolume: '0',
      totalUsers: 0,
    },
  },
};

// Test helpers
export const createMockFile = (name: string, type: string, size: number = 1024): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

export const mockLocalStorage = () => {
  const store: { [key: string]: string } = {};
  
  return {
    getItem: jestShim.fn((key: string) => store[key] || null),
    setItem: jestShim.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jestShim.fn((key: string) => {
      delete store[key];
    }),
    clear: jestShim.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

export const mockFetch = (response: any, ok: boolean = true) => {
  if ((globalThis as any).jest) {
    return (globalThis as any).jest.fn().mockResolvedValue({
      ok,
      json: (globalThis as any).jest.fn().mockResolvedValue(response),
    });
  }

  return () => Promise.resolve({
    ok,
    json: () => Promise.resolve(response),
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { mockWallet, mockConnection };
