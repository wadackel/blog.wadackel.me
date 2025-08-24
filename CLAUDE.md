# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal blog site built with HonoX (Hono + React-like framework) and deployed to Cloudflare Workers. Uses a file-based routing system with Markdown content organized by year in the `content/` directory.

## Development Commands

### Basic Development

- `pnpm dev` - Start development server on port 4321
- `pnpm build` - Production build (client build → server build in sequence)
- `pnpm preview` - Preview production build using Wrangler
- `pnpm deploy` - Build and deploy to Cloudflare Workers

### Code Quality

- `pnpm lint` - Run Oxlint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm format` - Format with Prettier + fix lint issues
- `pnpm format:lint` - Fix lint issues only
- `pnpm format:prettier` - Format with Prettier only

### Testing

- `pnpm test` - Run tests with Vitest (clean screenshots → run tests)
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:ui` - Run tests with Vitest UI

### Scaffolding

- `pnpm scaffold` - Generate components/pages using scaffdog

### Cleanup

- `pnpm clean` - Remove dist and screenshots
- `pnpm clean:all` - Remove dist, screenshots, and node_modules

## Architecture

### Framework Stack

- **HonoX**: Full-stack framework combining Hono (backend) with React-like frontend
- **Tailwind CSS v4**: New CSS-first architecture for styling
- **Cloudflare Workers**: Deployment target with static asset support
- **Vite**: Build tool with dual-mode configuration (client/server)

### Build System

The project adopts a dual-build approach:

1. Client build (`vite build --mode client`) - Builds CSS and client-side assets
2. Server build (`vite build`) - Builds Cloudflare Worker

### Directory Structure

- `app/` - HonoX application code
  - `routes/` - File-based routing (supports dynamic routes like `[year]/[slug].tsx`)
  - `islands/` - Client-side interactive components
  - `server.ts` - Main Hono application entry point
  - `style.css` - Global styles
- `content/` - Blog posts organized by year (Markdown files)
- `components/` - Reusable HonoX components
- `lib/` - Utility functions and shared logic
- `plugins/` - Custom plugins for Markdown processing
- `public/` - Static assets

### Routing Patterns

- `/` - Homepage (index.tsx)
- `/page/[page]` - Blog list with pagination
- `/[year]/[slug]` - Individual blog posts
- `/sitemap.xml` - Generated sitemap
- `/index.xml` - RSS feed

### Content Management

Blog posts are stored as Markdown files with frontmatter metadata in `content/[year]/`. The build process includes:

- Markdown processing with Remark/Rehype plugins
- Syntax highlighting with Prism.js
- Emoji support and accessibility
- Automatic slug generation and heading anchors

### Development Workflow

- Watch targets: `content/`, `lib/`, `components/`, `app/`, `plugins/`
- Hot reload for all code and content changes
- Strict mode TypeScript
- Fast linting with Oxlint
- Custom Prettier configuration
- Pre-commit hooks with Lefthook (Prettier formatting)

### Testing Environment

- **Vitest**: Test runner (with browser mode support)
- **Playwright**: Chromium provider for browser testing
- **Screenshot testing**: Automatically captures screenshots (saved to `./screenshots/`)
- **Global setup**: Configuration via `tests/setup.ts`

### Deployment

Deployed to Cloudflare Workers serving static assets from the `dist/` directory. Uses Wrangler for local preview and deployment.

## Coding Guidelines

### TypeScript Style

- **Prefer type aliases over interfaces**: Use `type` instead of `interface` for better composability and functional programming alignment
  - ✅ `type User = { name: string; email: string };`
  - ❌ `interface User { name: string; email: string; }`
- **Use arrow functions**: Prefer arrow function syntax over function declarations for consistency
  - ✅ `const handleClick = () => { ... };`
  - ❌ `function handleClick() { ... }`
- **Union types**: Extract reusable union types as separate type aliases
  - ✅ `type Status = 'pending' | 'success' | 'error';`

### Comments

- All code comments must be written in English
- Avoid Japanese comments and always use English
- If you find existing Japanese comments, rewrite them in English

### Writing Guidelines

When asked to write blog articles, refer to @WRITING.md for detailed writing style guidelines including:

- Tone and style preferences (polite Japanese with casual expressions)
- Article structure and composition
- Technical content handling
- Reader considerations
