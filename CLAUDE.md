# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gendless is a GenAI-powered autonomous product development platform that creates products using a custom Markdown-based file format. The system consists of three main components that work together to provide an AI-driven document generation and viewing experience.

## Architecture

### Monorepo Structure
- **api-spec/**: TypeSpec-based API specification using OpenAPI 3.0
- **cf-worker/**: Cloudflare Worker backend (Hono framework)
- **web-app/**: React frontend with Vite + Cloudflare integration

### Core Technologies
- **API Definition**: TypeSpec → OpenAPI → Zod validation schemas
- **Backend**: Cloudflare Workers, Hono, R2 storage, Cloudflare AI (Llama 4 Scout)
- **Frontend**: React 19, Vite, TailwindCSS, unified/remark ecosystem
- **Markdown Processing**: Custom directive support with QuickJS sandboxing

## Common Commands

### API Specification
```bash
cd api-spec
npm run build          # Compile TypeSpec → OpenAPI → generate client code
npm run tsp:compile     # Compile TypeSpec only
npm run generate-swagger # Generate Swagger HTML documentation
npm run orval           # Generate Zod schemas from OpenAPI
```

### Cloudflare Worker
```bash
cd cf-worker
npm run build           # Generate types and compile TypeScript
npm run cf-typegen      # Generate Cloudflare bindings types
npm run format          # Format code with Prettier
npm run api-spec:build  # Build API spec and copy validation schemas
```

### Web Application
```bash
cd web-app
npm run dev             # Start development server with worker build
npm run build           # Build for production
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format with Prettier
npm run deploy          # Build and deploy to Cloudflare
npm run build:cf-worker # Build and link worker dependency
```

## Development Workflow

### Making API Changes
1. Modify `api-spec/src/main.tsp`
2. Run `npm run build` in api-spec
3. Run `npm run api-spec:copy` in cf-worker to update validation schemas
4. Update worker handlers and domain logic as needed

### Code Generation Dependencies
- API spec changes trigger validation schema regeneration
- Worker types are generated from wrangler.jsonc configuration
- Frontend automatically links to built worker package

## Key Components

### Document Processing Pipeline
1. **Input**: Markdown files stored in R2 storage (`documents/` prefix)
2. **AI Processing**: LLMClient uses Cloudflare AI (Llama 4 Scout) for document transformation
3. **Output**: Generated timestamped documents with custom format support

### Markdown Enhancement System
- **Base**: Standard Markdown with remark/rehype processing
- **Custom Directives**: `::mycomponent` syntax for interactive components
- **Sandboxed Execution**: QuickJS for safe JavaScript execution
- **UI Components**: React components integrated into Markdown content

### Infrastructure Bindings
- **R2_BUCKET**: Object storage for documents (binding: "BUCKET")
- **AI**: Cloudflare AI platform (binding: "AI")
- **Environment**: Production deployment via Cloudflare Workers

## File Patterns

### Generated Files (Do Not Edit)
- `cf-worker/src/validation/*.gen.ts` - Auto-generated from API spec
- `cf-worker/src/worker-configuration.d.ts` - Auto-generated bindings
- `api-spec/tsp-output/` - TypeSpec compilation output
- `web-app/node_modules/gendless-cf-worker/` - Linked worker package

### Configuration Files
- `wrangler.jsonc` - Cloudflare Workers deployment configuration
- `tspconfig.yaml` - TypeSpec compiler configuration
- `orval.config.cjs` - Code generation configuration

## Testing and Quality

### Linting and Formatting
- ESLint with TypeScript support for web-app
- Prettier for consistent code formatting across all packages
- TypeScript strict mode enabled

### Build Validation
Always run these commands before committing:
```bash
# In web-app
npm run lint
npm run build

# In cf-worker  
npm run build

# In api-spec
npm run build
```