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

#### Automated Character Set Management

The `CHARACTER_SETS` object is now automatically maintained using the `update-font-character-sets.ts` script:

```bash
# Update CHARACTER_SETS automatically and regenerate fonts
pnpm generate:fonts:update

# Or run steps separately
tsx scripts/update-font-character-sets.ts  # Updates CHARACTER_SETS
pnpm generate:fonts                        # Generates font files
```

##### How it works

1. **Code Scanning**: Uses ts-morph to scan all TSX/JSX files for elements with `font-accent` or `font-accent-header` classes
2. **Text Extraction**: Extracts static text content from these elements and their props
   - **Direct text**: Text directly written in JSX elements (e.g., `<span>Hello</span>`)
   - **Props text**: String literal props passed to components (e.g., `<Component label="Hello" />`)
3. **Smart Filtering**: Filters out non-display text like alignment values, CSS classes, and short utility strings
4. **Space Preservation**: Properly handles JSX expressions to maintain correct word spacing (e.g., `Page {page} of {total}` → `"Page of"`)
5. **Automatic Update**: Updates the `CHARACTER_SETS` object in `generate-font-subsets.ts`
6. **Font Generation**: Runs the existing font subset generation process

##### Detected Usage

Current font usage automatically detected from the codebase:

- **Header** (`font-accent-header`): AnimatedLogo.tsx → `wadackel.me` 📝 (direct-text)
- **Footer** (`font-accent`): Footer.tsx → `tsuyoshi wada`, `© wadackel.me` 📝 (direct-text)
- **Pager** (`font-accent`): Pager.tsx → `Newer Post`, `Older Post` 🔗 (prop-value)
- **Pagination** (`font-accent`): Pagination.tsx → `Page of` 📝 (direct-text) + numbers 0-9

**Legend**: 📝 = Direct JSX text content, 🔗 = String props passed to components

#### Output

- Font files: `public/fonts/`
- CSS definitions: `app/fonts.css` (auto-generated)

#### When to regenerate

- **Automatically**: Run `pnpm generate:fonts:update` when adding new text that uses Caveat font
- **Manual font updates**: Run `pnpm generate:fonts` to update to newer font versions from Google Fonts
- **After code changes**: The automated system will detect most changes, but manual verification is recommended for complex updates

The TypeScript scripts automatically download the latest font versions from Google Fonts API with proper type safety.

#### Dependencies

- `ts-morph`: TypeScript AST manipulation for automated code scanning and CHARACTER_SETS updates
