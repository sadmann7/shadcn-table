# [Shadcn Table](https://shadcn-table-v2.vercel.app/)

This is a Shadcn table component with server-side sorting, filtering, and pagination. It is bootstrapped with `create-t3-app`.

[![Shadcn Table](./public/images/screenshot.png)](https://shadcn-table-v2.vercel.app/)

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **Table package:** [TanStack/react-table](https://tanstack.com/table/v8)
- **Database:** [PlanetScale](https://planetscale.com)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team)

## Features

- [x] Server-side pagination
- [x] Server-side sorting
- [x] Server-side filtering
- [x] Dynamic debounced search based on the searchable columns provided
- [x] Dynamic faceted-filtering based on the filterable columns provided

## Running Locally

1. Clone the repository

   ```bash
   git clone https://github.com/sadmann7/shadcn-table-v2.git
   ```

2. Install dependencies using pnpm

   ```bash
   pnpm install
   ```

3. Copy the `.env.example` to `.env` and update the variables.

   ```bash
   cp .env.example .env
   ```

4. Start the development server

   ```bash
   pnpm run dev
   ```

5. Push the database schema

   ```bash
   pnpm run db:push
   ```

## Codebase Overview

Watch the codebase overview video on [YouTube](https://www.youtube.com/watch?v=BsvjF5Y6-C8&t=1s).

Consider Subscribing to [Kavin's YouTube channel](https://www.youtube.com/@livecode247) for more videos.

## How do I deploy this?

Follow the deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
