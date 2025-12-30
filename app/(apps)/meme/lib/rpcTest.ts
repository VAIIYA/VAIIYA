import { Connection } from '@solana/web3.js';

export interface RPCStatus {
  endpoint: string;
  status: 'working' | 'failed';
  latency?: number;
  error?: string;
}

export async function testRPCEndpoints(): Promise<RPCStatus[]> {
  // Use environment variable if set, otherwise use user's Helius key
  const heliusKey = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.includes('helius-rpc.com') 
    ? process.env.NEXT_PUBLIC_SOLANA_RPC_URL
    : 'https://mainnet.helius-rpc.com/?api-key=a587065c-5910-40c5-b3dc-af50da9f275d';
  
  const endpoints = [
    // Helius RPC (premium, fast, reliable) - Primary choice
    heliusKey, // User's Helius key - ✅ Primary
    'https://solana-mainnet.g.alchemy.com/v2/Qc7vcbufkAgT7TuKvVrZ6', // Alchemy (premium) - ✅ Backup
    'https://solana-rpc.publicnode.com', // PublicNode (reliable) - ✅ Backup
    'https://go.getblock.us/86aac42ad4484f3c813079afc201451c', // GetBlock (working) - ✅ Backup
  ];

  const results: RPCStatus[] = [];

  // Test endpoints in parallel for faster results
  const testPromises = endpoints.map(async (endpoint) => {
    const startTime = Date.now();
    
    try {
      const connection = new Connection(endpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 15000, // Increased timeout
        wsEndpoint: endpoint.replace('https://', 'wss://'), // Add WebSocket support
      });

      // Test multiple RPC calls to ensure reliability
      const [blockhash, slot] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.getSlot()
      ]);
      
      const latency = Date.now() - startTime;
      
      const result = {
        endpoint,
        status: 'working' as const,
        latency
      };
      
      console.log(`✅ ${endpoint} - ${latency}ms`);
      return result;
      
    } catch (error) {
      const latency = Date.now() - startTime;
      
      const result = {
        endpoint,
        status: 'failed' as const,
        latency,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      console.log(`❌ ${endpoint} - Failed after ${latency}ms: ${result.error}`);
      return result;
    }
  });

  // Wait for all tests to complete
  const testResults = await Promise.allSettled(testPromises);
  
  testResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    }
  });

  return results;
}

export async function getBestRPCEndpoint(): Promise<string> {
  const results = await testRPCEndpoints();
  
  // Find the fastest working endpoint
  const workingEndpoints = results.filter(r => r.status === 'working');
  
  if (workingEndpoints.length === 0) {
    throw new Error('No working RPC endpoints found');
  }
  
  // Sort by latency and return the fastest
  workingEndpoints.sort((a, b) => (a.latency || 0) - (b.latency || 0));
  
  return workingEndpoints[0].endpoint;
}

export async function testCurrentConnection(connection: Connection): Promise<boolean> {
  try {
    await connection.getLatestBlockhash();
    return true;
  } catch (error) {
    console.error('Current RPC connection test failed:', error);
    return false;
  }
}

// Quick test function for debugging
export async function quickRPCTest(): Promise<void> {
  console.log('🔍 Testing RPC endpoints...');
  const results = await testRPCEndpoints();
  
  console.log('📊 RPC Test Results:');
  results.forEach(result => {
    const status = result.status === 'working' ? '✅' : '❌';
    const latency = result.latency ? ` (${result.latency}ms)` : '';
    console.log(`${status} ${result.endpoint}${latency}`);
  });
  
  const workingEndpoints = results.filter(r => r.status === 'working');
  if (workingEndpoints.length === 0) {
    console.error('🚨 No working RPC endpoints found!');
  } else {
    console.log(`✅ Found ${workingEndpoints.length} working endpoint(s)`);
  }
}
