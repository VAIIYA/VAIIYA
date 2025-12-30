// Lottery Configuration
// Change this to switch between USDC and SOL versions

export const LOTTERY_CONFIG = {
  // Set to 'USDC' for USDC transactions, 'SOL' for SOL transactions
  CURRENCY: 'USDC' as 'USDC' | 'SOL',
  
  // USDC Configuration
  USDC: {
    TICKET_PRICE: 1.00, // 1.00 USDC per ticket
    MINT_ADDRESS: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mint on mainnet
    DECIMALS: 6, // USDC has 6 decimals
  },
  
  // SOL Configuration
  SOL: {
    TICKET_PRICE: 0.01, // 0.01 SOL per ticket
    MINT_ADDRESS: 'So11111111111111111111111111111111111111112', // SOL token address
    DECIMALS: 9, // SOL has 9 decimals
  },
  
  // Lottery House Wallet (server wallet)
  LOTTERY_HOUSE_WALLET: '7UhwWmw1r15fqLKcbYEDVFjqiz2G753MsyDksFAjfT3e',
  
  // House Commission (percentage of each ticket sale)
  HOUSE_COMMISSION: 0.05, // 5% commission
  
  // SOL Fee for server wallet funding (hidden from users)
  SOL_FEE: 0.0001, // 0.0001 SOL per ticket for server wallet funding
  
  // Network Configuration
  NETWORK: 'mainnet-beta', // or 'devnet' for testing
  
  // Bonus Token Configuration (27 token)
  BONUS_TOKEN: {
    MINT_ADDRESS: 'FboiZ9EBwaVvzeKGJtbGsU2M8GjKLDhhZCDNar8hjups',
    AMOUNT_PER_WINNER: 1000, // 1000 tokens per winner
    DECIMALS: 6, // Most SPL tokens use 6 decimals, adjust if needed
  },
};

// Helper functions
export const getTicketPrice = () => {
  return LOTTERY_CONFIG.CURRENCY === 'USDC' 
    ? LOTTERY_CONFIG.USDC.TICKET_PRICE 
    : LOTTERY_CONFIG.SOL.TICKET_PRICE;
};

export const getCurrencySymbol = () => {
  return LOTTERY_CONFIG.CURRENCY;
};

export const getCurrencyDecimals = () => {
  return LOTTERY_CONFIG.CURRENCY === 'USDC' 
    ? LOTTERY_CONFIG.USDC.DECIMALS 
    : LOTTERY_CONFIG.SOL.DECIMALS;
};

export const getHouseCommission = () => {
  return LOTTERY_CONFIG.HOUSE_COMMISSION;
};

export const calculateCommission = (amount: number) => {
  return amount * LOTTERY_CONFIG.HOUSE_COMMISSION;
};

export const calculatePotContribution = (amount: number) => {
  return amount * (1 - LOTTERY_CONFIG.HOUSE_COMMISSION);
};

export const getSolFee = () => {
  return LOTTERY_CONFIG.SOL_FEE;
};

