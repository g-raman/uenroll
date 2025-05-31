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
