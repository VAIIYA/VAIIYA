// NFT.Storage service for uploading token images to IPFS
const NFT_STORAGE_API_KEY = '6ec350a8.ae8baa2978484fdd89cdacac21f1d2cb';
const NFT_STORAGE_API_URL = 'https://api.nft.storage';

export interface UploadResult {
  success: boolean;
  url?: string;
  cid?: string;
  error?: string;
}

export class NFTStorageService {
  private apiKey: string;

  constructor(apiKey: string = NFT_STORAGE_API_KEY) {
    this.apiKey = apiKey;
  }

  /**
   * Upload a token image to IPFS via NFT.Storage
   * @param file - The image file to upload
   * @returns Promise<UploadResult> - Upload result with IPFS URL
   */
  async uploadTokenImage(file: File): Promise<UploadResult> {
    try {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: 'File size exceeds 5MB limit'
        };
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: 'Only image files are allowed (JPG, PNG, WebP, GIF)'
        };
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload to NFT.Storage
      const response = await fetch(`${NFT_STORAGE_API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Upload failed'
        };
      }

      const data = await response.json();

      // Return IPFS URL
      return {
        success: true,
        url: `https://ipfs.io/ipfs/${data.value.cid}`,
        cid: data.value.cid
      };

    } catch (error) {
      console.error('NFT.Storage upload error:', error);
      return {
        success: false,
        error: 'Upload failed. Please try again.'
      };
    }
  }

  /**
   * Validate image dimensions
   * @param file - The image file to validate
   * @returns Promise<boolean> - Whether the image meets size requirements
   */
  async validateImageDimensions(file: File): Promise<{ valid: boolean; width?: number; height?: number; error?: string }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        
        if (width < 512 || height < 512) {
          resolve({
            valid: false,
            width,
            height,
            error: `Image must be at least 512x512px. Current size: ${width}x${height}px`
          });
        } else {
          resolve({
            valid: true,
            width,
            height
          });
        }
      };
      
      img.onerror = () => {
        resolve({
          valid: false,
          error: 'Could not load image for validation'
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get IPFS gateway URL from CID
   * @param cid - IPFS content identifier
   * @returns string - IPFS gateway URL
   */
  getIPFSUrl(cid: string): string {
    return `https://ipfs.io/ipfs/${cid}`;
  }

  /**
   * Get multiple IPFS gateway URLs for redundancy
   * @param cid - IPFS content identifier
   * @returns string[] - Array of IPFS gateway URLs
   */
  getIPFSGateways(cid: string): string[] {
    return [
      `https://ipfs.io/ipfs/${cid}`,
      `https://gateway.pinata.cloud/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
      `https://dweb.link/ipfs/${cid}`
    ];
  }
}

// Export singleton instance
export const nftStorageService = new NFTStorageService();
