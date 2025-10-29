# Meta Ads Copy Generator - User Guide

## Purpose

Generate optimized advertising copy for Meta Ads campaigns using AI. Create multiple variations of headlines, primary texts, and descriptions tailored to your client's brand voice and campaign objectives.

## Access

Login required. After authentication, you can manage knowledge bases and generate campaigns.

---

## Powered by Manus

**Frontend**: React 19 with TypeScript provides type-safe development and modern UI components via shadcn/ui and Tailwind CSS 4 for responsive, accessible design.

**Backend**: Express 4 with tRPC 11 enables end-to-end type safety between frontend and backend, eliminating API integration errors and providing intelligent autocompletion.

**Database**: MySQL/TiDB with Drizzle ORM stores client knowledge bases and campaign history with full ACID compliance and automatic schema migrations.

**AI Integration**: OpenAI GPT-4 with specialized copywriting instructions generates persuasive ad copy using proven frameworks (AIDA, PAS, 4Cs) adapted to campaign objectives.

**Authentication**: Manus OAuth provides secure, seamless login with persistent sessions across devices.

**Deployment**: Auto-scaling infrastructure with global CDN ensures fast load times worldwide and handles traffic spikes automatically.

---

## Using Your Website

Start by creating a knowledge base for your client. Click "Bases de Conocimiento" → "Nueva Base". Fill in business details, target audience demographics and psychographics, brand tone of voice, and unique value proposition. The more complete the information, the better the generated copy.

Next, generate a campaign. Click "Generar Campaña" → select your knowledge base → choose campaign objective (Awareness, Traffic, Leads, or Sales) → optionally specify product focus and offer details → click "Generar Campaña". The AI generates multiple communication angles with 2-3 variations per field in 5-15 seconds.

Review the results organized by communication angle. Each angle shows Primary Texts, Headlines, and Descriptions with character counts. Orange warnings appear when recommended limits are exceeded (125 for primary text, 40 for headline, 30 for description). Click the copy icon next to any text to copy it to your clipboard, then paste directly into Meta Ads Manager.

---

## Managing Your Website

Use the **Database** panel to view and manage all knowledge bases and generated campaigns with full CRUD operations and search capabilities.

Access the **Settings → General** panel to customize your website name and logo displayed in the header.

Check the **Dashboard** panel for usage analytics and system status after your site is published.

---

## Next Steps

Talk to Manus AI anytime to request changes or add features. Try generating your first campaign by creating a knowledge base with detailed client information, then experiment with different campaign objectives to see how the AI adapts messaging frameworks.
