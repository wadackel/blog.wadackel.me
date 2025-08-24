# Scripts

This directory contains utility scripts for the blog project.

## Font Subset Generation

### `generate-font-subsets.ts`

Generates optimized Caveat font subsets for use throughout the blog application.

#### Usage

```bash
# Generate font subsets
pnpm generate:fonts

# Or run directly
tsx scripts/generate-font-subsets.ts
```

#### What it does

1. **Header Subset** (`caveat-header.*`)
   - Minimal subset containing only characters used in "wadackel.me"
   - Size: ~5KB (woff2)
   - Uses `font-display: block` to prevent flickering

2. **Comprehensive Subset** (`caveat-comprehensive.*`)
   - Contains only characters actually used throughout the application
   - Includes: Header, Footer, Pager, Pagination text + numbers
   - Size: ~13KB (woff2) - significantly reduced from original
   - Uses `font-display: swap` for better loading performance

#### Configuration

Character sets can be modified in the `CHARACTER_SETS` object:

```typescript
const CHARACTER_SETS = {
  header: {
    name: 'caveat-header',
    characters: 'wadackel.me',
  },
  comprehensive: {
    name: 'caveat-comprehensive',
    characters: 'wadackel.me tsuyoshi wada © Newer Post Older Post Page of 0123456789',
  },
} as const;
```

#### Output

- Font files: `public/fonts/`
- CSS definitions: `app/fonts.css` (auto-generated)

#### When to regenerate

- When adding new text that uses Caveat font
- When changing the header logo text
- When adding new components that use accent fonts
- To update to newer font versions

The TypeScript script automatically downloads the latest font versions from Google Fonts API with proper type safety.
