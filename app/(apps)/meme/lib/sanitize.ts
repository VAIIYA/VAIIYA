/**
 * Input sanitization utilities for security
 */

/**
 * Sanitizes a string by removing potentially dangerous characters
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .slice(0, maxLength) // Limit length
    .replace(/[<>\"'&]/g, '') // Remove HTML/XML characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim();
}

/**
 * Sanitizes a token name
 */
export function sanitizeTokenName(name: string): string {
  return sanitizeString(name, 32)
    .replace(/[^a-zA-Z0-9\s]/g, '') // Only allow alphanumeric and spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

/**
 * Sanitizes a token symbol
 */
export function sanitizeTokenSymbol(symbol: string): string {
  return sanitizeString(symbol, 10)
    .replace(/[^a-zA-Z0-9]/g, '') // Only allow alphanumeric
    .toUpperCase()
    .trim();
}

/**
 * Sanitizes a URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    
    return urlObj.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitizes a Twitter handle
 */
export function sanitizeTwitterHandle(handle: string): string {
  if (!handle) return '';
  
  // Remove @ symbol if present
  const cleaned = handle.replace(/^@/, '');
  
  // Only allow alphanumeric and underscores
  const sanitized = cleaned.replace(/[^a-zA-Z0-9_]/g, '');
  
  return sanitized.slice(0, 15); // Twitter handle limit
}

/**
 * Sanitizes a Telegram handle
 */
export function sanitizeTelegramHandle(handle: string): string {
  if (!handle) return '';
  
  // Remove @ symbol if present
  const cleaned = handle.replace(/^@/, '');
  
  // Only allow alphanumeric and underscores
  const sanitized = cleaned.replace(/[^a-zA-Z0-9_]/g, '');
  
  return sanitized.slice(0, 32); // Telegram handle limit
}

/**
 * Sanitizes a number input
 */
export function sanitizeNumber(input: string, maxValue: number = Number.MAX_SAFE_INTEGER): number {
  if (!input) return 0;
  
  const num = parseFloat(input);
  
  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }
  
  if (num < 0) {
    return 0;
  }
  
  if (num > maxValue) {
    return maxValue;
  }
  
  return num;
}

/**
 * Sanitizes a percentage value
 */
export function sanitizePercentage(input: string): number {
  const num = sanitizeNumber(input, 100);
  return Math.min(Math.max(num, 0), 100);
}

/**
 * Sanitizes a file name
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return '';
  
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '') // Only allow safe characters
    .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
    .slice(0, 255); // Limit length
}

/**
 * Validates and sanitizes form data
 */
export interface TokenFormData {
  name: string;
  symbol: string;
  description: string;
  image: File | null;
  imageUrl?: string;
  socialLinks: {
    twitter: string;
    telegram: string;
    website: string;
  };
  tokenomics: {
    totalSupply: string;
    initialPrice: string;
    communityFee: string;
  };
}

const defaultTokenFormData: TokenFormData = {
  name: '',
  symbol: '',
  description: '',
  image: null,
  socialLinks: {
    twitter: '',
    telegram: '',
    website: '',
  },
  tokenomics: {
    totalSupply: '1000000000',
    initialPrice: '0.0001',
    communityFee: '10',
  },
};

interface SanitizeTokenFormOptions {
  preserveBinaryFields?: boolean;
}

export function sanitizeTokenFormData(
  data: Partial<TokenFormData>,
  previous: TokenFormData = defaultTokenFormData,
  options: SanitizeTokenFormOptions = { preserveBinaryFields: true }
): TokenFormData {
  const base = previous ?? defaultTokenFormData;
  const preserveBinary = options.preserveBinaryFields ?? true;

  return {
    name: sanitizeTokenName(data.name ?? base.name),
    symbol: sanitizeTokenSymbol(data.symbol ?? base.symbol),
    description: sanitizeString(data.description ?? base.description, 500),
    image: preserveBinary ? (data.image ?? base.image ?? null) : null,
    imageUrl: preserveBinary ? (data.imageUrl ?? base.imageUrl) : undefined,
    socialLinks: {
      twitter: sanitizeTwitterHandle(data.socialLinks?.twitter ?? base.socialLinks.twitter),
      telegram: sanitizeTelegramHandle(data.socialLinks?.telegram ?? base.socialLinks.telegram),
      website: sanitizeUrl(data.socialLinks?.website ?? base.socialLinks.website),
    },
    tokenomics: {
      totalSupply: sanitizeNumber((data.tokenomics?.totalSupply ?? base.tokenomics.totalSupply ?? '0')).toString(),
      initialPrice: sanitizeNumber((data.tokenomics?.initialPrice ?? base.tokenomics.initialPrice ?? '0')).toString(),
      communityFee: sanitizePercentage((data.tokenomics?.communityFee ?? base.tokenomics.communityFee ?? '0')).toString(),
    },
  };
}

/**
 * Validates if a string is safe for display
 */
export function isSafeString(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  
  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /on\w+\s*=/i, // Event handlers
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Escapes HTML characters
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
