# uEnroll 🏛️

A modern, open-source schedule builder for uOttawa.

# Local Setup

> [!NOTE]
> You will need [Node.js](https://nodejs.org/en), [pnpm](https://pnpm.io/), and [docker](https://www.docker.com/) installed.
> Optional: install the `turbo` cli globally via pnpm.

## Initialize

### Clone Repo

```bash
git clone https://github.com/g-raman/uenroll.git
```

### Install dependencies

```bash
pnpm install
```

## Setup Database

Run Postgres instance locally

```bash
docker compose up -d
```

Run migrations

```bash
pnpm --filter @repo/db db:migrate
```

Seed database with dummy data

```bash
pnpm --filter @repo/db db:seed
```

## Setup webapp

```bash
pnpm dlx turbo dev --filter web
```

or if you have the `turbo` cli installed

```bash
turbo dev --filter web
```

# Advanced Setup

## Database viewer

You can use the drizzle client (Recommended) to view the database and run SQL queries.
You can also use any database client that supports PostgreSQLof your choice (Beekeeper Studio, DBeaver, pgadmin, etc.)

```bash
pnpm --filter @repo/db db:studio
```

You can now open `http://local.drizzle.studio` in your web browser of choice.

> [!CAUTION]
> Safari/Brave/MacOS users, access via a browser to localhost is denied by default.
> You need to create self signed certificate and drizzle studio should work.

```bash
brew install mkcert
mkcert -install
```

Restart your studio and you should be able to view it now.
