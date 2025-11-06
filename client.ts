import axios, { AxiosInstance } from 'axios';
import {
  BannerbearImageRequest,
  BannerbearImageResponse,
  BannerbearImage,
  BannerbearModification,
} from './types';

const BASE_URL = 'https://api.bannerbear.com/v2';
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_ATTEMPTS = 45; // 90 seconds total (45 * 2s)

/**
 * Bannerbear API Client
 * Handles image generation with polling for completion
 */
export class BannerbearClient {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds for API calls
    });
  }

  /**
   * Generate an image and wait for completion
   * @param templateUid - Bannerbear template UID
   * @param modifications - Array of layer modifications
   * @returns Promise with completed image URL and UID
   */
  async generateImage(
    templateUid: string,
    modifications: BannerbearModification[]
  ): Promise<{ uid: string; image_url: string }> {
    try {
      // 1. Create image request
      const payload: BannerbearImageRequest = {
        template: templateUid,
        modifications,
      };

      const response = await this.client.post<BannerbearImageResponse>(
        '/images',
        payload
      );

      const { uid, status } = response.data;

      console.log(`[Bannerbear] Image created: ${uid}, status: ${status}`);

      // 2. Poll for completion
      const imageUrl = await this.pollImageStatus(uid);

      return { uid, image_url: imageUrl };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get image status
   * @param imageUid - Image UID to check
   * @returns Promise with image data
   */
  async getImageStatus(imageUid: string): Promise<BannerbearImage> {
    try {
      const response = await this.client.get<BannerbearImage>(
        `/images/${imageUid}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Poll image status until completed or timeout
   * @param imageUid - Image UID to check
   * @returns Promise with image URL
   */
  private async pollImageStatus(imageUid: string): Promise<string> {
    let attempts = 0;

    while (attempts < MAX_POLL_ATTEMPTS) {
      await this.sleep(POLL_INTERVAL);
      attempts++;

      try {
        const image = await this.getImageStatus(imageUid);
        const { status, image_url, error } = image;

        console.log(
          `[Bannerbear] Polling attempt ${attempts}/${MAX_POLL_ATTEMPTS}: ${status}`
        );

        if (status === 'completed' && image_url) {
          console.log(`[Bannerbear] Image completed: ${image_url}`);
          return image_url;
        }

        if (status === 'failed') {
          throw new Error(`Image generation failed: ${error || 'Unknown error'}`);
        }

        // Status is still 'pending', continue polling
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // Image not found yet, continue polling
          console.log(`[Bannerbear] Image not found yet, retrying...`);
        } else {
          throw error;
        }
      }
    }

    throw new Error(
      `Image generation timed out after ${MAX_POLL_ATTEMPTS * POLL_INTERVAL / 1000} seconds`
    );
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      console.error(`[Bannerbear] API Error (${status}): ${message}`);

      if (status === 401) {
        throw new Error('Invalid Bannerbear API key');
      }

      if (status === 404) {
        throw new Error('Bannerbear template not found');
      }

      if (status === 422) {
        throw new Error(`Bannerbear validation error: ${message}`);
      }

      throw new Error(`Bannerbear API error (${status}): ${message}`);
    }

    throw error;
  }
}

// Singleton instance
let bannerbearClient: BannerbearClient | null = null;

/**
 * Get or create Bannerbear client singleton
 */
export function getBannerbearClient(): BannerbearClient {
  if (!bannerbearClient) {
    const apiKey = process.env.BANNERBEAR_API_KEY;

    if (!apiKey) {
      throw new Error('BANNERBEAR_API_KEY environment variable not set');
    }

    bannerbearClient = new BannerbearClient(apiKey);
  }

  return bannerbearClient;
}
