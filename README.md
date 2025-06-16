# [Shadcn Table](https://tablecn.com)

This is a shadcn table component with server-side sorting, filtering, and pagination. It is bootstrapped with `create-t3-app`.

[![Shadcn Table](./public/images/screenshot.png)](https://tablecn.com)

## Documentation

See the [documentation](https://diceui.com/docs/components/data-table) to get started.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **Table package:** [TanStack/react-table](https://tanstack.com/table/latest)
- **Database:** [Neon](https://neon.tech) / PostgreSQL
- **ORM:** [Drizzle ORM](https://orm.drizzle.team) via Database Adapter Pattern
- **Validation:** [Zod](https://zod.dev)

## Features

- [x] Server-side pagination, sorting, and filtering
- [x] Customizable columns
- [x] Auto generated filters from column definitions
- [x] Dynamic `Data-Table-Toolbar` with search, filters, and actions
- [x] `Notion/Airtable` like advanced filtering
- [x] `Linear` like filter menu for command palette filtering
- [x] Action bar on row selection
- [x] Database adapter pattern for ORM/database flexibility

## Architecture

This project uses a **Database Adapter Pattern** that provides a unified interface for different ORMs and databases. This design offers:

- **Database Agnostic**: Easy to switch between different ORMs/databases
- **Type Safety**: Full TypeScript support with compile-time error checking  
- **Extensibility**: Easy to add new database adapters
- **Performance**: Each adapter can optimize for specific database features

### Supported Adapters

**Drizzle ORM Adapter** (Default)
- Full-featured PostgreSQL adapter using Drizzle ORM
- Supports complex filtering, transactions, and aggregations
- Optimized for type safety and performance

**Supabase Adapter**
- PostgREST-based adapter for Supabase
- Real-time capabilities and built-in authentication
- Ideal for serverless deployments

### Switching Database Adapters

The application defaults to the Drizzle adapter. To use different adapters:

```bash
# Run with Drizzle (default)
pnpm run dev

# Run with Supabase adapter
pnpm run dev:supabase

# Build and start with Supabase
pnpm run build
pnpm run start:supabase
```

## Prerequisites

### Required Tools

- **Node.js** (v18 or later)
- **pnpm** package manager
- **Docker** (for PostgreSQL)

### Optional Tools

- **Supabase CLI** (for Supabase development)
  ```bash
  # Install via Homebrew (macOS)
  brew install supabase/tap/supabase
  
  # Install via npm (cross-platform)
  npm install -g supabase
  ```

## Running Locally

### With Drizzle (Default)

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

4. (Optional) Run database using docker-compose.yml file

   ```bash
   docker compose up
   ```

5. Push the database schema

   ```bash
   pnpm run db:push
   ```

6. Seed the database

   ```bash
   pnpm run db:seed
   ```

7. Start the development server

   ```bash
   pnpm run dev
   ```

### With Supabase

1. Follow steps 1-3 from above

2. Initialize Supabase project

   ```bash
   supabase start
   ```

3. Apply migrations and seed data

   ```bash
   supabase db reset
   ```

4. Update your `.env` file with Supabase connection details:

   ```bash
   SUPABASE_URL="http://127.0.0.1:54321"
   SUPABASE_ANON_KEY="your_anon_key_from_supabase_start"
   ```

5. Start the development server with Supabase adapter

   ```bash
   pnpm run dev:supabase
   ```
```

## Testing

The project includes comprehensive tests for the database adapter pattern:

```bash
# Run all tests (Drizzle adapter)
pnpm run test

# Test Supabase adapter specifically
pnpm run test:supabase
```

The test suite validates:
- **CRUD Operations**: Creating, reading, updating, and deleting records
- **Complex Filtering**: Text search, numeric ranges, date filtering, multi-select
- **Filter Builder**: Value normalization, relative dates, operator handling
- **Interface Compliance**: Ensures any adapter implementation follows the contract
- **Error Handling**: Graceful handling of invalid inputs and database errors

This comprehensive testing ensures that the adapter pattern works reliably across different database backends.

**Prerequisites**: Make sure your database is running before executing the tests.

## How do I deploy this?

Follow the deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Credits

- [shadcn/ui](https://github.com/shadcn-ui/ui/tree/main/apps/www/app/(app)/examples/tasks) - For the initial implementation of the data table.
