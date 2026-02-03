# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **scraper** app within the uenroll monorepo. It scrapes course data from the University of Ottawa public course registry and stores it in a PostgreSQL database.

## Commands

```bash
# Run the full course scraper
bun run scrape:courses

# Scrape available subjects only
bun run scrape:subjects

# Scrape available terms only
bun run scrape:terms

# Database cleanup
bun run db:cleanup

# Type checking
bun run check-types

# Linting
bun run lint
```

## Architecture

### Scraping Flow

The scraper follows this data flow:

1. **main.ts** - Entry point that orchestrates the scraping process
   - Fetches available terms and subjects from the database
   - Iterates through each term → subject → year (1-5) combination
   - Handles the 300-item search limit by splitting into English/French queries

2. **getSubjectByYear.ts** - Makes HTTP requests to uOttawa's course registry
   - Manages session cookies via `fetch-cookie`
   - Retrieves ICSID token (session identifier) with retry logic
   - Constructs POST request with search parameters

3. **scrapeSearchResults.ts** - Parses HTML response using cheerio
   - Extracts: courses, course components (sections), and sessions
   - Returns `CourseDetailsInsert` object for database upsert

### Key Patterns

**Error Handling**: Uses `neverthrow` library for type-safe Result types throughout. Functions return `Result<T, Error>` or `ResultAsync<T, Error>`.

**Session Management**: The `fetchCookie` wrapper from `fetch-cookie` maintains cookies across requests. ICSID tokens are extracted from the initial page load and used in subsequent POST requests.

**Search Limit Workaround**: When results exceed 300 items, the scraper automatically retries with language filters (English-only, then French-only) to get complete data.

### Data Model

The scraper produces three entity types (defined in `@repo/db/types`):

- **Course** - courseCode, courseTitle, term
- **CourseComponent** - section details (e.g., LEC, DGD, LAB)
- **Session** - individual meeting times with instructor, day, time, dates

### CSS Selectors

HTML parsing relies on PeopleSoft's predictable ID patterns:

- `win0divSSR_CLSRSLT_WRK_GROUPBOX2$N` - Course containers
- `win0divSSR_CLSRSLT_WRK_GROUPBOX3$N` - Section containers
- Helper functions `getIdSelector()` and `getIdStartsWithSelector()` build these selectors

## Dependencies

- **@repo/db** - Shared database package with queries and types
- **cheerio** - HTML parsing
- **fetch-cookie** - Cookie jar for session persistence
- **neverthrow** - Type-safe error handling
- **pino** - Structured logging
