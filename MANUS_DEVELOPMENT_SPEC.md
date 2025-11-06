        throw new Error(
          `Bannerbear API error (${status}): ${message}`
        );
      }
      throw error;
    }
  }
  
  /**
   * Poll image status until completed
   * @param imageUid - Image UID to check
   * @returns Promise with image URL
   */
  private async pollImageStatus(imageUid: string): Promise<string> {
    let attempts = 0;
    
    while (attempts < MAX_POLL_ATTEMPTS) {
      await this.sleep(POLL_INTERVAL);
      
      try {
        const response = await this.client.get<BannerbearImage>(
          `/images/${imageUid}`
        );
        
        const { status, image_url } = response.data;
        
        if (status === 'completed' && image_url) {
          return image_url;
        }
        
        if (status === 'failed') {
          throw new Error('Image generation failed');
        }
        
        // Status is still 'pending', continue polling
        
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // Image not found yet, continue polling
        } else {
          throw error;
        }
      }
      
      attempts++;
    }
    
    throw new Error('Image generation timed out after 90 seconds');
  }
  
  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
let bannerbearClient: BannerbearClient | null = null;

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
```

#### File: `server/bannerbear/types.ts`

```typescript
export interface BannerbearImageRequest {
  template: string;
  modifications: Array<{
    name: string;
    text?: string;
    image_url?: string;
    color?: string;
  }>;
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
```

### 2. Photos Router

#### File: `server/routers/photos.ts`

```typescript
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { clientPhotos } from '../../drizzle/schema';

export const photosRouter = router({
  /**
   * List all photos for a client
   */
  listClientPhotos: protectedProcedure
    .input(z.object({
      clientId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const photos = await ctx.db.query.clientPhotos.findMany({
        where: eq(clientPhotos.clientId, input.clientId),
        orderBy: (photos, { desc }) => [desc(photos.uploadedAt)],
      });
      
      return { photos };
    }),
  
  /**
   * Get single photo by ID
   */
  getPhoto: protectedProcedure
    .input(z.object({
      photoId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const photo = await ctx.db.query.clientPhotos.findFirst({
        where: eq(clientPhotos.id, input.photoId),
      });
      
      if (!photo) {
        throw new Error('Photo not found');
      }
      
      return { photo };
    }),
  
  /**
   * Upload new photo (future feature)
   */
  uploadPhoto: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      filename: z.string(),
      url: z.string().url(),
      description: z.string().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const [photo] = await ctx.db.insert(clientPhotos)
        .values({
          clientId: input.clientId,
          filename: input.filename,
          url: input.url,
          description: input.description,
          category: input.category,
        })
        .returning();
      
      return { photo };
    }),
});
```

### 3. Bannerbear Router

#### File: `server/routers/bannerbear.ts`

```typescript
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { clients, generatedImages } from '../../drizzle/schema';
import { getBannerbearClient } from '../bannerbear/client';
import { GenerateImageParams } from '../bannerbear/types';

export const bannerbearRouter = router({
  /**
   * Generate images for all 3 formats
   */
  generateImages: protectedProcedure
    .input(z.object({
      campaignId: z.number(),
      headline: z.string().max(100),
      description: z.string().max(200),
      photoUrl: z.string().url(),
      clientId: z.number(),
      selectedPhotoId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. Get client configuration
      const client = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.clientId),
      });
      
      if (!client) {
        throw new Error('Client not found');
      }
      
      // 2. Validate required fields
      if (!client.bannerbearTemplateStories ||
          !client.bannerbearTemplateFeed45 ||
          !client.bannerbearTemplateFeed11 ||
          !client.logoUrl ||
          !client.badge1Url ||
          !client.badge2Url ||
          !client.badge3Url) {
        throw new Error('Client Bannerbear configuration incomplete');
      }
      
      // 3. Prepare modifications data
      const imageData: GenerateImageParams = {
        headline: input.headline,
        subtitle: input.description,
        cta: 'Book Free Estimate', // Static for now
        logoUrl: client.logoUrl,
        photoUrl: input.photoUrl,
        badge1Url: client.badge1Url,
        badge2Url: client.badge2Url,
        badge3Url: client.badge3Url,
      };
      
      // 4. Generate all 3 images in parallel
      const bannerbear = getBannerbearClient();
      
      const [storiesResult, feed45Result, feed11Result] = await Promise.allSettled([
        generateSingleImage(bannerbear, client.bannerbearTemplateStories, imageData),
        generateSingleImage(bannerbear, client.bannerbearTemplateFeed45, imageData),
        generateSingleImage(bannerbear, client.bannerbearTemplateFeed11, imageData),
      ]);
      
      // 5. Handle results
      const images: Array<{ format: string; url: string; uid: string }> = [];
      const errors: string[] = [];
      
      if (storiesResult.status === 'fulfilled') {
        images.push({ format: 'stories', ...storiesResult.value });
      } else {
        errors.push(`Stories: ${storiesResult.reason}`);
      }
      
      if (feed45Result.status === 'fulfilled') {
        images.push({ format: 'feed_4_5', ...feed45Result.value });
      } else {
        errors.push(`Feed 4:5: ${feed45Result.reason}`);
      }
      
      if (feed11Result.status === 'fulfilled') {
        images.push({ format: 'feed_1_1', ...feed11Result.value });
      } else {
        errors.push(`Feed 1:1: ${feed11Result.reason}`);
      }
      
      // 6. If all failed, throw error
      if (images.length === 0) {
        throw new Error(`All image generations failed: ${errors.join(', ')}`);
      }
      
      // 7. Save to database
      const savedImages = await ctx.db.insert(generatedImages)
        .values(
          images.map(img => ({
            campaignId: input.campaignId,
            format: img.format,
            imageUrl: img.url,
            bannerbearUid: img.uid,
            selectedPhotoId: input.selectedPhotoId,
          }))
        )
        .returning();
      
      // 8. Return results
      return {
        images: images.map(img => ({
          format: img.format,
          url: img.url,
        })),
        errors: errors.length > 0 ? errors : undefined,
      };
    }),
});

/**
 * Helper function to generate a single image
 */
async function generateSingleImage(
  bannerbear: ReturnType<typeof getBannerbearClient>,
  templateUid: string,
  data: GenerateImageParams
): Promise<{ url: string; uid: string }> {
  const modifications = [
    { name: 'headline', text: data.headline },
    { name: 'subtitle', text: data.subtitle },
    { name: 'cta', text: data.cta },
    { name: 'logo', image_url: data.logoUrl },
    { name: 'background_image', image_url: data.photoUrl },
    { name: 'badge_gaf', image_url: data.badge1Url },
    { name: 'badge_malarkey', image_url: data.badge2Url },
    { name: 'badge_cslb', image_url: data.badge3Url },
  ];
  
  const result = await bannerbear.generateImage(templateUid, modifications);
  
  return {
    url: result.image_url,
    uid: result.uid,
  };
}
```

### 4. Environment Variables

#### File: `.env.example`

```bash
# Existing variables...

# Bannerbear Configuration
BANNERBEAR_API_KEY=bb_pr_68c446c743c4b27916126868d25fa3
```

Add to `.env`:
```bash
BANNERBEAR_API_KEY=bb_pr_68c446c743c4b27916126868d25fa3
```

---

## 🎨 FRONTEND DEVELOPMENT

### Component Structure

```
client/src/
├── components/
│   ├── AngleSelector.tsx       # NEW: Select marketing angle
│   ├── PhotoSelector.tsx       # NEW: Select photo from library
│   ├── ImagePreview.tsx        # NEW: Preview generated images
│   ├── ImageGenerationStatus.tsx # NEW: Loading state with progress
│   └── CopySelector.tsx        # MODIFY: Update for new flow
├── pages/
│   └── GenerateCampaign.tsx    # MODIFY: Orchestrate new flow
└── utils/
    └── downloadZip.ts          # NEW: ZIP download utility
```

### 1. AngleSelector Component

#### File: `client/src/components/AngleSelector.tsx`

```tsx
import { useState } from 'react';

interface Angle {
  id: string;
  name: string;
  description: string;
  example: string;
}

const ANGLES: Angle[] = [
  {
    id: 'pain',
    name: 'Pain-Focused',
    description: 'Highlight customer problems and create urgency',
    example: '"Leaking roof? Storm damage? Get help now!"',
  },
  {
    id: 'authority',
    name: 'Authority-Focused',
    description: 'Emphasize experience, certifications, and credibility',
    example: '"20+ Years Experience • Licensed & Insured • 5.0★ Rating"',
  },
  {
    id: 'value',
    name: 'Value-Focused',
    description: 'Promote offers, pricing, and competitive advantages',
    example: '"Best Prices in SLO County • Free Estimates • Same-Day Service"',
  },
];

interface AngleSelectorProps {
  onSelectAngle: (angleId: string) => void;
  selectedAngle: string | null;
}

export function AngleSelector({ onSelectAngle, selectedAngle }: AngleSelectorProps) {
  return (
    <div className="angle-selector">
      <h2 className="text-2xl font-bold mb-4">
        Step 1: Select Your Marketing Angle
      </h2>
      
      <p className="text-gray-600 mb-6">
        Choose the approach that best fits your campaign goal. This will determine
        the tone and messaging of your ad copys.
      </p>
      
      <div className="angles-grid">
        {ANGLES.map((angle) => (
          <button
            key={angle.id}
            onClick={() => onSelectAngle(angle.id)}
            className={`angle-card ${
              selectedAngle === angle.id ? 'selected' : ''
            }`}
          >
            <div className="angle-header">
              <input
                type="radio"
                checked={selectedAngle === angle.id}
                onChange={() => onSelectAngle(angle.id)}
                className="angle-radio"
              />
              <h3 className="angle-name">{angle.name}</h3>
            </div>
            
            <p className="angle-description">{angle.description}</p>
            
            <div className="angle-example">
              <span className="example-label">Example:</span>
              <span className="example-text">{angle.example}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

#### Styles: `client/src/components/AngleSelector.css`

```css
.angle-selector {
  margin: 2rem 0;
}

.angles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.angle-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  text-align: left;
}

.angle-card:hover {
  border-color: #343585;
  box-shadow: 0 4px 12px rgba(52, 53, 133, 0.1);
  transform: translateY(-2px);
}

.angle-card.selected {
  border-color: #E52933;
  background: #fef2f2;
  box-shadow: 0 4px 16px rgba(229, 41, 51, 0.2);
}

.angle-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;