# [Shadcn Table](https://table.sadmn.com)

This is a Shadcn table component with server-side sorting, filtering, and pagination. It is bootstrapped with `create-t3-app`.

[![Shadcn Table](./public/images/screenshot.png)](https://table.sadmn.com)

> **Warning**
> This project is still in development and is not ready for production use.
>
> It uses new technologies (ppr, and drizzle ORM) which are subject to change and may break your application.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **Table package:** [TanStack/react-table](https://tanstack.com/table/v8)
- **Database:** [Neon](https://neon.tech)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team)
- **Validation:** [Zod](https://zod.dev)
- **Optimizing compiler:** [million](https://million.dev)

## Features

- [x] Server-side pagination, sorting, and filtering (via `useDataTable` hook)
- [x] Customizable columns (`dataTable` and `columns` props)
- [x] Dynamic debounced search inputs (`searchableColumns` prop)
- [x] Dynamic faceted filters (`filterableColumns` prop)
- [x] Optional notion like advanced filtering (`advancedFilter` prop)
- [x] Optional floating bar on row selection, rendred at the bottom (`floatingBar` prop)
- [x] Action to delete rows (`deleteRowsAction` prop)

## Running Locally

1. Clone the repository

   ```bash
   git clone https://github.com/sadmann7/shadcn-table
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

Consider subscribing to Kavin Desi Valli's [YouTube channel](https://www.youtube.com/@livecode247) for more videos.

## How do I deploy this?

Follow the deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## How to use the data-table component

1. Clone the Repo

   ```bash
   git clone https://github.com/sadmann7/shadcn-table
   ```

   OR

   ```bash
   git clone https://github.com/arvind-iyer-2001/shadcn-table
   ```

2. Copy the following folders and files into your project (configured with ) at the exact specific locations

   - `src/components/data-table`
   - `src/db/index.ts`
   - `src/hooks`
   - `src/lib`
   - `src/types`

   Also install the required shadcn components and other required packages with the following commands:

   ```bash
   pnpm dlx shadcn-ui@latest init

   pnpm dlx shadcn-ui@latest add button badge checkbox command dialog dropdown-menu input popover select separator skeleton table toast

   pnpm add drizzle-orm postgres @tanstack/react-table zod sonner @t3-oss/env-nextjs
   pnpm add -D drizzle-kit dotenv-cli pg tsx
   ```

3. Configure your Environment Variables
   Then set up the Database URL, for this example, we're using PlanetScale MySQL2 Database. Our schemas will also be made using this.

4. Database Actions: For this you can use any ORM of your choice, but for the sake of this particular example, we're using [Drizzle ORM](https://orm.drizzle.team) and [Neon](https://neon.tech/).

   As an example, lets use the `tasks` table.

   - Create the Table Schema at `@/db/schema.ts`
   - Create the associated zod validations `@/lib/validations/tasks.ts` file

5. Setting up the Table

   - **Create Files**: Create `page.tsx` and, if needed, `layout.tsx` in your app directory.
   - **Copy Directories**: Copy `./_components` and `./_lib` directories into your project.
   - **Update Queries/Mutations**: Modify `./_lib/queries.ts`, `./_lib/actions.ts`, and `./_lib/mutations.ts` to match your database operations.
   - **Update Floating Bar**: Update `./_components/tasks-table-floating-bar.tsx` to match your table's actions (optional).
   - **Define Table Columns**: Update `./_components/tasks-table-columns.tsx` to define column headers, actions, searchable and filterable columns.
   - **Setup Data Fetching**: In `./page.tsx`, define `getTasksPromise` for use in `./_components/tasks-table.tsx`.
   - **Fetch Data**: In `./_components/tasks-table.tsx`, consume the `getTasksPromise` promise using the `React.use` hook. The promise is passed to trigger the `suspense` boundary.
   - **Memoize Table Columns**: In `./_components/tasks-table.tsx`, memoize columns defined in `./_components/tasks-table-columns.tsx` using `React.useMemo` hook to prevent unnecessary re-renders.
   - **Use Data Table Hook**: In `./_components/tasks-table.tsx`, call `./hooks/useTasksTable.tsx` hook to handle server-side pagination, sorting, and filtering.
   - **Remove Demo Inputs**: Make sure to remove demo inputs from `./components/task-table.tsx`. These were used to show the advanced filter and floating bar features.
