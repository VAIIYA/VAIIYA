import lighthouse from '@lighthouse-web3/sdk';

const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || '1eee22b1.3238b8b9eb13459e89e7ff5f2d94a14d';

/**
 * Upload a file to Lighthouse.storage and return the gateway URL
 * @param file - File or Buffer to upload
 * @param name - Name for the file
 * @returns Promise<string> - Gateway URL (https://gateway.lighthouse.storage/ipfs/<CID>)
 */
export async function uploadFile(file: File | Buffer, name: string): Promise<string> {
  try {
    console.log('Uploading file to Lighthouse.storage:', name);
    
    // Convert File to Buffer if needed
    let buffer: Buffer;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }

    // Upload to Lighthouse
    const uploadResponse = await lighthouse.uploadBuffer(
      buffer,
      LIGHTHOUSE_API_KEY,
      name as any
    );

    if (!uploadResponse.data || !uploadResponse.data.Hash) {
      throw new Error('Failed to upload file to Lighthouse: No hash returned');
    }

    const cid = uploadResponse.data.Hash;
    const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
    
    console.log('File uploaded successfully to Lighthouse:', gatewayUrl);
    return gatewayUrl;
  } catch (error) {
    console.error('Error uploading file to Lighthouse:', error);
    throw new Error(`Failed to upload file to Lighthouse: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload JSON object to Lighthouse.storage and return the gateway URL
 * @param json - JSON object to upload
 * @param name - Name for the JSON file
 * @returns Promise<string> - Gateway URL (https://gateway.lighthouse.storage/ipfs/<CID>)
 */
export async function uploadJSON(json: object, name: string): Promise<string> {
  try {
    console.log('Uploading JSON to Lighthouse.storage:', name);
    
    // Stringify the JSON object
    const jsonString = JSON.stringify(json, null, 2);
    const buffer = Buffer.from(jsonString, 'utf-8');

    // Upload to Lighthouse
    const uploadResponse = await lighthouse.uploadBuffer(
      buffer,
      LIGHTHOUSE_API_KEY,
      `${name}.json` as any
    );

    if (!uploadResponse.data || !uploadResponse.data.Hash) {
      throw new Error('Failed to upload JSON to Lighthouse: No hash returned');
    }

    const cid = uploadResponse.data.Hash;
    const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
    
    console.log('JSON uploaded successfully to Lighthouse:', gatewayUrl);
    return gatewayUrl;
  } catch (error) {
    console.error('Error uploading JSON to Lighthouse:', error);
    throw new Error(`Failed to upload JSON to Lighthouse: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload image file and return the gateway URL
 * @param imageFile - Image file to upload
 * @param tokenSymbol - Token symbol for naming
 * @returns Promise<string> - Gateway URL for the image
 */
export async function uploadTokenImage(imageFile: File, tokenSymbol: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const name = `token-images/${timestamp}-${tokenSymbol.toLowerCase()}.png`;
    
    return await uploadFile(imageFile, name);
  } catch (error) {
    console.error('Error uploading token image:', error);
    throw error;
  }
}

/**
 * Upload token metadata JSON and return the gateway URL
 * @param metadata - Token metadata object
 * @param tokenSymbol - Token symbol for naming
 * @returns Promise<string> - Gateway URL for the metadata
 */
export async function uploadTokenMetadata(metadata: object, tokenSymbol: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const name = `token-metadata/${timestamp}-${tokenSymbol.toLowerCase()}`;
    
    return await uploadJSON(metadata, name);
  } catch (error) {
    console.error('Error uploading token metadata:', error);
    throw error;
  }
}

/**
 * Test Lighthouse connection
 * @returns Promise<boolean> - True if connection is successful
 */
export async function testLighthouseConnection(): Promise<boolean> {
  try {
    console.log('Testing Lighthouse connection...');
    
    // Try to upload a small test file
    const testData = Buffer.from('test', 'utf-8');
    const uploadResponse = await lighthouse.uploadBuffer(
      testData,
      LIGHTHOUSE_API_KEY,
      'test.txt' as any
    );

    if (uploadResponse.data && uploadResponse.data.Hash) {
      console.log('Lighthouse connection test successful');
      return true;
    } else {
      console.error('Lighthouse connection test failed: No hash returned');
      return false;
    }
  } catch (error) {
    console.error('Lighthouse connection test failed:', error);
    return false;
  }
}
