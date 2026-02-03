# 🏛️ uEnroll

A modern, open-source schedule builder for uOttawa.

[Check it out here](https://uenroll.ca)

# Local Setup

> [!NOTE]
> You will need [bun](https://bun.com/) (v1.3.x), and [Docker](https://www.docker.com/) (latest) installed.
> Optional: Install `turbo` and `wrangler` globally via `bun`

## Initialize

### Clone Repo

```bash
git clone https://github.com/g-raman/uenroll.git
```

### Install dependencies

```bash
cd uenroll
```

```bash
bun install
```

Build dependencies

```bash
bun run build
```

## Setup Database

Run Postgres instance locally

> [!WARNING]
> Make sure the docker engine is running.

```bash
bun run db:up
```

Seed database

```bash
bun run db:seed
```

Running this command populates the database with seed data.

See the [Populate with real data](#populate-with-real-data) section if you want more/better data.

Or alternatively see the [Request seed file](#request-seed-file) section.

## Setup webapp

```bash
bun run dev:web
```

# Advanced Setup

## Database viewer

You can use the drizzle client (Recommended) to view the database and run SQL queries.
You can also use any database client that supports PostgreSQL of your choice (Beekeeper Studio, DBeaver, pgadmin, etc.)

```bash
bun run db:studio
```

You can now open `http://local.drizzle.studio` in your web browser of choice.

> [!CAUTION]
> Safari/Brave/MacOS users, access via a browser to localhost is denied by default.
> You need to create self signed certificate and drizzle studio should work.
> For brave you also need to disable shields for the website.

```bash
brew install mkcert
mkcert -install
```

Restart your studio and you should be able to view it now.

## Populate with real data

> [!CAUTION]
> The dev mode for cloudflare workflows is a little janky. You will see a lot of errors on the screen.
> It's fine to ignore these, the scraper should pick up most of the course catalogue.
> There are some issues around concurrency so some courses will be missing.
> Refer to the [Request seed file](#request-seed-file) section for accurate data.

If you'd like to see actual data from the uOttawa public course registry.

You can run the scraper against your local database instance.

You can run the following commands (assuming database is running):

```bash
bun run dev:scraper
```

The default port for triggering cron jobs is 8787.

If there's no port conflicts, run the following command to trigger the scraper.

```bash
curl http://localhost:8787/cdn-cgi/handler/scheduled
```

Depending on network bottlenecks, the scraping should be done within 5-10 minutes.

> [!CAUTION]
> The postgres instance running inside docker doesn't persist data to your disk.
> If you want to populate your local database with real data.
> Modify the `compose.yml` file to persist data to disk so you don't have to keep running the scraper.

## Request seed file

If you don't want to wait for the scraper to run. You can request the `seed.sql` file from me.

Send me an [e-mail](mailto:gr.gupta.raman@gmail.com).

Install postgresql via your package manager or from the [website](https://www.postgresql.org/).
Install version 18. We're gonna use the `psql` utility to dump the contents of the file into the local db.

```bash
psql 'postgresql://postgres:postgres@localhost:5432/postgres' < seed.sql
```
