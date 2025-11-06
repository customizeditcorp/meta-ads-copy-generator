/**
 * Bannerbear API Types
 * Based on Bannerbear API v2 documentation
 */

export interface BannerbearModification {
  name: string;
  text?: string;
  image_url?: string;
  color?: string;
}

export interface BannerbearImageRequest {
  template: string;
  modifications: BannerbearModification[];
  webhook_url?: string;
  metadata?: Record<string, any>;
}

export interface BannerbearImageResponse {
  uid: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  self: string;
}

export interface BannerbearImage {
  uid: string;
  status: 'pending' | 'completed' | 'failed';
  image_url: string | null;
  image_url_png: string | null;
  image_url_jpg: string | null;
  created_at: string;
  self: string;
  error?: string;
}

export interface GenerateImageParams {
  headline: string;
  subtitle: string;
  cta: string;
  logoUrl: string;
  photoUrl: string;
  badge1Url: string;
  badge2Url: string;
  badge3Url: string;
}

export interface GeneratedImageResult {
  uid: string;
  image_url: string;
  format: string;
}
