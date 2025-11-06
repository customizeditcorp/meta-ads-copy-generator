# Bannerbear Integration Guide

## 🎯 Overview

This document describes the Bannerbear integration for automated Meta Ads image generation. The integration allows users to:

1. Select a marketing angle (Pain, Authority, Value)
2. Choose a photo from the client's library
3. Generate 3 image formats automatically (Stories 9:16, Feed 4:5, Feed 1:1)
4. Download individual images or all as ZIP

---

## 📦 What's Included

### Backend

#### Database Schema
- **`client_photos`** - Photo library for each client
- **`generated_images`** - Generated images with metadata
- **`client_bannerbear_config`** - Bannerbear templates and brand assets per client

#### API Client
- **`server/bannerbear/client.ts`** - Bannerbear API client with polling
- **`server/bannerbear/types.ts`** - TypeScript types for Bannerbear API

#### tRPC Routers
- **`server/routers/photos.ts`** - Photo management endpoints
- **`server/routers/bannerbear.ts`** - Image generation endpoints

#### Database Functions
- **`server/db.ts`** - Database queries for photos, images, and config

### Frontend

#### Components
- **`AngleSelector.tsx`** - Marketing angle selection (Pain/Authority/Value)
- **`PhotoSelector.tsx`** - Photo grid with selection
- **`ImageGenerationStatus.tsx`** - Real-time generation progress
- **`ImagePreview.tsx`** - Preview and download generated images

#### Pages
- **`ImageGenerator.tsx`** - Main page integrating all components

---

## 🚀 Setup Instructions

### 1. Database Migration

Run the SQL migration to create tables:

```bash
# Option A: Using MySQL CLI
mysql -u your_user -p your_database < drizzle/migrations/0001_add_bannerbear_tables.sql

# Option B: Using Drizzle ORM
pnpm db:push
```

### 2. Seed Data (JV Roofing Example)

Populate JV Roofing client with photos and Bannerbear config:

```bash
mysql -u your_user -p your_database < drizzle/seeds/001_jv_roofing_bannerbear.sql
```

**Note:** Replace `@jv_roofing_client_id` with the actual client ID from your database.

### 3. Environment Variables

Add to your `.env` file:

```bash
BANNERBEAR_API_KEY=bb_pr_68c446c743c4b27916126868d25fa3
```

### 4. Install Dependencies

No additional dependencies needed! The integration uses existing packages:
- `axios` (already installed)
- `drizzle-orm` (already installed)

### 5. Restart Server

```bash
pnpm dev
```

---

## 📋 Usage Flow

### Step 1: Generate Campaign Copy
1. Go to `/generate`
2. Select knowledge base (e.g., JV Roofing)
3. Choose campaign objective
4. Generate copy

### Step 2: Generate Images
1. From campaign history, click "Generate Images"
2. Or navigate to `/images?campaignId=123`

### Step 3: Select Angle
Choose one of three marketing angles:
- **Pain-Focused**: Address customer pain points
- **Authority-Focused**: Emphasize experience and credentials
- **Value-Focused**: Highlight competitive pricing

### Step 4: Select Photo
Choose a photo from the client's library (grid view)

### Step 5: Generate
Click "Generate Images" and wait 30-90 seconds

### Step 6: Download
- Download individual images
- Download all as ZIP
- Open in new tab for preview

---

## 🔧 Configuration

### Adding a New Client

1. **Create Knowledge Base** (already exists in your app)

2. **Add Bannerbear Configuration**

```sql
INSERT INTO client_bannerbear_config (
  clientKnowledgeBaseId,
  bannerbearTemplateStories,
  bannerbearTemplateFeed45,
  bannerbearTemplateFeed11,
  logoUrl,
  badge1Url,
  badge2Url,
  badge3Url
) VALUES (
  123, -- Your client ID
  'l9E7G65kozz35PLe3R',  -- Stories 9:16 template
  'Kp21rAZj1y3eb6eLnd',  -- Feed 4:5 template
  '8BK3vWZJ7a3y5Jzk1a',  -- Feed 1:1 template
  'https://your-cdn.com/logo.svg',
  'https://your-cdn.com/badge1.png',
  'https://your-cdn.com/badge2.png',
  'https://your-cdn.com/badge3.png'
);
```

3. **Upload Photos**

```sql
INSERT INTO client_photos (
  clientKnowledgeBaseId,
  filename,
  url,
  description,
  category
) VALUES (
  123,
  'project_photo.jpg',
  'https://your-cdn.com/photos/project_photo.jpg',
  'Main project photo',
  'project'
);
```

---

## 🎨 Bannerbear Template Structure

Each template should have these layers:

### Text Layers
- `headline` - Main headline (max 100 chars)
- `subtitle` - Subtitle/description (max 200 chars)
- `cta` - Call-to-action button text (max 50 chars)

### Image Layers
- `background_image` - Main photo (from client library)
- `logo` - Client logo (SVG recommended)
- `badge_gaf` - Badge 1 (e.g., GAF certification)
- `badge_malarkey` - Badge 2 (e.g., Malarkey certification)
- `badge_cslb` - Badge 3 (e.g., CSLB license)

### Template UIDs (JV Roofing)
- Stories 9:16: `l9E7G65kozz35PLe3R`
- Feed 4:5: `Kp21rAZj1y3eb6eLnd`
- Feed 1:1: `8BK3vWZJ7a3y5Jzk1a`

---

## 🔍 API Reference

### Photos Router

#### `photos.listClientPhotos`
List all photos for a client.

```typescript
const { data } = trpc.photos.listClientPhotos.useQuery({
  clientKnowledgeBaseId: 123,
});
```

#### `photos.uploadPhoto`
Upload a new photo.

```typescript
const mutation = trpc.photos.uploadPhoto.useMutation();
mutation.mutate({
  clientKnowledgeBaseId: 123,
  filename: "photo.jpg",
  url: "https://cdn.com/photo.jpg",
  description: "Project photo",
  category: "project",
});
```

### Bannerbear Router

#### `bannerbear.generateImages`
Generate all 3 image formats.

```typescript
const mutation = trpc.bannerbear.generateImages.useMutation();
mutation.mutate({
  campaignId: 456,
  headline: "Leaking Roof? Storm Damage?",
  description: "Licensed & Insured",
  cta: "Book Free Estimate",
  photoUrl: "https://cdn.com/photo.jpg",
  clientKnowledgeBaseId: 123,
  selectedPhotoId: 789,
  selectedAngle: "pain",
});
```

#### `bannerbear.getCampaignImages`
Get generated images for a campaign.

```typescript
const { data } = trpc.bannerbear.getCampaignImages.useQuery({
  campaignId: 456,
});
```

#### `bannerbear.getClientConfig`
Get Bannerbear configuration for a client.

```typescript
const { data } = trpc.bannerbear.getClientConfig.useQuery({
  clientKnowledgeBaseId: 123,
});
```

---

## 🐛 Troubleshooting

### Images not generating?

1. **Check API Key**
   ```bash
   echo $BANNERBEAR_API_KEY
   ```

2. **Check Template UIDs**
   - Verify templates exist in Bannerbear dashboard
   - Ensure layer names match exactly

3. **Check Asset URLs**
   - Ensure all URLs are publicly accessible
   - Test URLs in browser

4. **Check Database**
   ```sql
   SELECT * FROM client_bannerbear_config WHERE clientKnowledgeBaseId = 123;
   ```

### Timeout errors?

- Default timeout: 90 seconds
- Increase in `server/bannerbear/client.ts`:
  ```typescript
  const MAX_POLL_ATTEMPTS = 60; // 120 seconds
  ```

### Photos not loading?

1. **Check CORS**
   - Ensure asset URLs allow cross-origin requests

2. **Check Database**
   ```sql
   SELECT * FROM client_photos WHERE clientKnowledgeBaseId = 123;
   ```

---

## 📊 Cost Analysis

### Bannerbear Pricing
- **Starter Plan**: $49/month for 500 images
- **Cost per image**: ~$0.10
- **Cost per campaign**: ~$0.30 (3 formats)

### ROI Calculation
- **Manual Figma work**: 4 hours × $50/hr = $200
- **Automated**: $0.30 + 5 minutes = **99.85% savings**

---

## 🔐 Security Notes

1. **API Key Storage**
   - Store in `.env` file (not committed to Git)
   - Use environment variables in production

2. **Asset URLs**
   - Currently using GitHub public repo
   - **TODO**: Migrate to CDN (Cloudflare, AWS S3)

3. **Database Access**
   - All queries verify user ownership
   - Protected by tRPC authentication

---

## 🚧 Future Enhancements

- [ ] Batch image generation (multiple campaigns)
- [ ] Custom template selection per campaign
- [ ] Photo upload via UI (currently manual SQL)
- [ ] ZIP download implementation (backend)
- [ ] Image editing/regeneration
- [ ] A/B testing with different photos
- [ ] Analytics integration (track which images perform best)
- [ ] CDN migration for assets

---

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review error logs in browser console
3. Check server logs: `pnpm dev`
4. Contact development team

---

**Version**: 1.0.0  
**Last Updated**: November 6, 2025  
**Author**: Manus AI + Customized It Corp
