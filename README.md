# Meta Ads Copy Generator

AI-powered copy generator for Meta (Facebook/Instagram) advertising campaigns. Automatically generates professional ad copy, headlines, descriptions, and lead form content using advanced AI and proven sales methodologies.

## Features

### 🎯 Core Functionality
- **AI-Powered Copy Generation**: Generate complete Meta Ads campaigns with primary text, headlines, and descriptions
- **Document Import**: Upload client knowledge base documents and automatically extract structured information
- **Lead Form Generation**: Create complete lead generation forms with custom qualifying questions
- **Multi-Language Support**: Generate copy in English with Spanish interface
- **Character Limit Validation**: Automatic enforcement of Meta Ads character limits (125/40/30)

### 🧠 Advanced Capabilities
- **Margarita Pasos Sales Methodology**: Integrated 7 ARCs framework for professional B2C sales
- **Multiple Campaign Angles**: Generate 2-3 different strategic approaches per campaign
- **4 Variations Per Field**: 4 primary texts, 4 headlines, 4 descriptions per angle
- **Campaign Objectives**: Support for Awareness, Consideration, and Conversion campaigns
- **Copy-to-Clipboard**: One-click copying for all generated content

### 📊 Knowledge Base Management
- Client-specific knowledge bases with:
  - Business information and industry
  - Products and services
  - Target demographics and psychographics
  - Pain points and desires
  - Tone of voice and brand guidelines
  - USP and differentiators
  - Value propositions

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB with Drizzle ORM
- **AI**: OpenAI GPT-4 API
- **Auth**: Manus OAuth
- **File Processing**: Mammoth (Word documents)

## Installation

```bash
# Clone the repository
git clone https://github.com/customizeditcorp/meta-ads-copy-generator.git
cd meta-ads-copy-generator

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Add your OPENAI_API_KEY and other required variables

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

## Environment Variables

Required environment variables:

```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Database
DATABASE_URL=your_database_connection_string

# OAuth (Manus)
JWT_SECRET=your_jwt_secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=your_app_id

# App Configuration
VITE_APP_TITLE=Meta Ads Copy Generator
VITE_APP_LOGO=your_logo_url
```

## Usage

### 1. Create Knowledge Base

1. Navigate to "Bases de Conocimiento"
2. Click "Nueva Base"
3. Either:
   - **Import documents**: Upload .docx files with client information
   - **Manual entry**: Fill in the form manually
4. Save the knowledge base

### 2. Generate Campaign

1. Go to "Generar Campaña"
2. Select a knowledge base
3. Choose campaign objective (Awareness, Consideration, Conversion)
4. Optionally specify product/service and offer
5. Click "Generar Campaña"
6. Review generated content with multiple angles and variations

### 3. Use Generated Content

- Click copy buttons to copy individual texts
- Paste directly into Meta Ads Manager
- Use lead form questions in Meta Lead Ads forms

## Project Structure

```
meta-ads-copy-generator/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # tRPC client and utilities
│   │   └── App.tsx        # Main app component
│   └── public/            # Static assets
├── server/                # Backend Express + tRPC
│   ├── _core/            # Core server functionality
│   ├── db.ts             # Database queries
│   ├── routers.ts        # tRPC routes
│   ├── documentExtractor.ts  # AI document processing
│   └── fileParser.ts     # File parsing utilities
├── drizzle/              # Database schema and migrations
│   └── schema.ts         # Database schema
└── shared/               # Shared types and constants
```

## Key Components

### Document Extractor
Processes uploaded documents using AI to extract structured client information:
- Business details
- Target audience
- Pain points and desires
- Tone of voice
- Value propositions

### Campaign Generator
Generates complete Meta Ads campaigns using:
- Margarita Pasos 7 ARCs methodology
- AIDA, PAS, and 4Cs copywriting frameworks
- Client knowledge base context
- Campaign objective-specific strategies

### Lead Form Generator
Creates Meta Lead Ads forms with:
- Form headline and description
- 2-3 custom qualifying questions
- Multiple choice options
- Thank you message
- CTA button text

## Margarita Pasos Integration

The system applies the 7 ARCs (Areas Clave del Proceso de Ventas) based on campaign objective:

1. **Awareness**: Opening conversation + Creating chemistry
2. **Consideration**: Identifying needs + Presenting solution
3. **Conversion**: Handling objections + Closing sale

## API Cost Optimization

- Document import: ~$0.02-0.05 per import
- Campaign generation: ~$0.01-0.03 per generation
- Efficient prompt engineering to minimize token usage

## Future Enhancements

- [ ] Multi-AI support (Claude, Grok, DeepSeek)
- [ ] Campaign comparison mode
- [ ] Inline text editing
- [ ] CSV/JSON export
- [ ] Campaign templates
- [ ] A/B testing recommendations
- [ ] Performance tracking integration

## Migration to Lovable

This project is designed to be migrated to Lovable for production use. See migration documentation for details on adapting the schema and integrating with Supabase.

## Contributing

This is a private project for Customized It Corp. For questions or support, contact the development team.

## License

Proprietary - All rights reserved by Customized It Corp.

## Acknowledgments

- Built with [Manus](https://manus.im) development platform
- Inspired by Margarita Pasos sales methodology
- Powered by OpenAI GPT-4

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Maintained by**: Customized It Corp
