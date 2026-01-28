## Project Overview

This is `@repo/ui`, a React component library / design system package within the `uenroll` monorepo. It provides styled, accessible UI components built on Base UI primitives (`@base-ui/react`) and Tailwind CSS v4.

## Commands

```bash
# Lint
bun run lint

# Format (run from monorepo root)
bun run format

# Install dependencies (from monorepo root)
bun install
```

There is no test suite or build step configured for this package. The monorepo uses **Turbo** for task orchestration and **Bun 1.3.2** as the package manager.

## Architecture

### Monorepo Context

```
uenroll/
├── apps/web/          # Next.js web app (primary consumer)
├── apps/scraper/
├── packages/ui/       # THIS PACKAGE
├── packages/db/
├── packages/env/
├── packages/eslint-config/
└── packages/typescript-config/
```

### Package Structure

- `src/components/*.tsx` — UI components (exported via `@repo/ui/components/*`)
- `src/lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)
- `src/styles/shadcn.css` — Tailwind CSS theme with OKLch CSS custom properties
- `src/hooks/` — Shared hooks (exported via `@repo/ui/hooks/*`)

### Component Patterns

**Base UI migration**: The project is actively migrating from Radix UI to Base UI (`@base-ui/react`). New components should use Base UI primitives.

**Key conventions**:

- Every component element must have a `data-slot` attribute (e.g., `data-slot="dialog-overlay"`)
- Style variants use `class-variance-authority` (CVA)
- Class merging uses the `cn()` utility from `@repo/ui/lib/utils`
- Compound component pattern for multi-part components (e.g., `Dialog`, `DialogTrigger`, `DialogContent`)
- Named exports only, no default exports

**Styling**:

- Tailwind CSS v4 with `@tailwindcss/postcss`
- Theme defined via CSS custom properties in OKLch color space (light/dark themes)
- `tw-animate-css` for animations
- `prettier-plugin-tailwindcss` for class sorting

### shadcn/ui Configuration

The `components.json` configures the shadcn CLI with style `base-vega`, `neutral` base color, CSS variables enabled, and `lucide` icons. Path aliases:

- `@repo/ui/components` → `src/components/`
- `@repo/ui/lib/utils` → `src/lib/utils.ts`
- `@repo/ui/hooks` → `src/hooks/`

### Key Dependencies

- **React 19** with Base UI and some remaining Radix UI primitives
- **Tailwind CSS 4** with CSS custom properties theming
- **lucide-react** for icons
- **sonner** for toast notifications
- **cmdk** for command palette
