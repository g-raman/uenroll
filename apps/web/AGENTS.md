## Project Overview

uEnroll is a schedule builder for University of Ottawa students. This is the `apps/web` package in a Turborepo monorepo.

## Commands

**Build & Lint:**

```bash
bun build            # Production build
bun lint             # ESLint (zero warnings allowed)
bun check-types      # TypeScript type checking
```

**WASM (schedule generator):**

```bash
bun build:wasm       # Build Rust WASM module to public/wasm/
```

## Architecture

### Monorepo Packages

If you make changes to these packages you must rebuild them.

- `@repo/db` - Drizzle ORM schema, queries, PostgreSQL connection
- `@repo/env` - Type-safe environment variables via @t3-oss/env-core (exports `/server` and `/client`)
- `@repo/ui` - shadcn/ui components built on Radix UI

### State Management

Three Zustand stores manage application state:

- **colourStore** - Assigns colors to courses from a shuffled palette
- **modeStore** - Toggles between manual selection and generation mode
- **generatorStore** - Holds generated schedules and navigation state

### URL State

Course selections are persisted in URL via `nuqs`:

- `useTermParam()` - Selected academic term
- `useDataParam()` - Selected sessions (compressed in URL, type `Selected = Record<courseCode, string[]>`)

### Data Flow

1. User searches → tRPC query to `@repo/db/queries`
2. Selected courses stored in URL (`?data=...`)
3. `useCourseQueries` fetches full course data for selected codes
4. Mappers in `utils/mappers/` transform courses → calendar events
5. Calendar renders via Schedule-X library (desktop) or custom CalendarMobile (mobile)

### Two Calendar Modes

- **Manual mode** (`isGenerationMode: false`): User selects individual sections
- **Generation mode** (`isGenerationMode: true`): WASM generates optimal schedules, user navigates with prev/next

### Key Types (src/types/Types.tsx)

- `Selected` - Map of courseCode to selected subSection IDs
- `ColouredCourse` - Course with assigned display color
- `ScheduleItem` - Section with alternatives and course metadata

### tRPC Router (src/server/index.ts)

- `getCourseByTermAndCourseCode` - Fetch single course
- `getAvailableTerms` - List terms with courses
- `getAvailableCoursesByTerm` - Autocomplete data for a term

### Calendar Events

Events use recurrence rules (RRule) for weekly patterns. Mappers in `utils/mappers/calendar.ts` convert courses/schedules to calendar-compatible event objects.

## Tech Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS 4 + shadcn/ui
- tRPC + TanStack Query
- Zustand (state) + nuqs (URL state)
- Rust WASM module for schedule generation

## Never do these things

- Never make barrell export files.
