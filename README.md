# uEnroll 🏛️

A modern, open-source schedule builder for uOttawa.

# Local Setup

> [!NOTE]
> You will need [Node.js](https://nodejs.org/en) (v22), [pnpm](https://pnpm.io/) (v10), and [Docker](https://www.docker.com/) (latest) installed.
> Optional: install the `turbo` cli globally via pnpm.

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
pnpm install
```

Build dependencies

```bash
pnpm dlx turbo build --filter web
```

<details>
    <summary>(Alternative) With turbo cli</summary>

```bash
turbo build --filter web
```

</details>

## Setup Database

Run Postgres instance locally

```bash
docker compose up -d
```

Run migrations

```bash
pnpm --filter @repo/db db:init
```

This step is optional. This commands seeds the database with dummy data.

See the [Populate with real data](#populate-with-real-data) section if you want better data.

Or alternatively see the [Request seed file](#request-seed-file) section.

```bash
pnpm --filter @repo/db db:seed
```

## Setup webapp

```bash
pnpm dlx turbo dev --filter web
```

<details>
    <summary>With turbo cli</summary>

```bash
turbo dev --filter web
```

</details>

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
> For brave you also need to disable shields for the website.

```bash
brew install mkcert
mkcert -install
```

Restart your studio and you should be able to view it now.

## Populate with real data

If you'd like to see actual data from the uOttawa public course registry.

You can run the scraper against your local database instance.

Depending on your hardware and network bottlenecks. This should take anywhere from 1h - 1.5h to scrape all three terms.
However, you can modify the code to only scrape one or two terms for faster results.

> [!CAUTION]
> The postgres instance running inside docker doesn't persist data to your disk.
> If you want to populate your local database with real data.
> Modify the `compose.yml` file to persist data to disk so you don't have to keep running the scraper.

Build the scraper project and it's dependencies.

```bash
pnpm dlx turbo build --filter scraper
```

Make the scrape script file executable.

```bash
chmod +x ./apps/scraper/src/scrape.sh
```

Run the scraper script.

> [!WARNING]
> Make sure the docker engine is running.

```bash
./apps/scraper/src/scrape.sh
```

## Request seed file

If you don't want to wait for the scraper to run (understandable). You can request the `seed.sql` file from me.

Send me an [e-mail](mailto:gr.gupta.raman@gmail.com).

Install postgresql via your package manager or from the [website](https://www.postgresql.org/).
Install version 17. We're gonna use the `psql` utility to dump the contents of the file into the local db.

```bash
psql 'postgresql://postgres:postgres@localhost:5432/postgres' < seed.sql
```
