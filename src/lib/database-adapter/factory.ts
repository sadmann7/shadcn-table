import { z } from "zod";
import type { Task } from "@/db/schema";
import type { AdapterConfig, DatabaseAdapter, DrizzleAdapterConfig, SupabaseAdapterConfig } from "./types";

// Zod schema for task validation and type inference
export const taskSchema = z.object({
  id: z.string().length(30),
  code: z.string().max(128),
  title: z.string().max(128).nullable(),
  status: z.enum(['todo', 'in-progress', 'done', 'canceled']),
  label: z.enum(['bug', 'feature', 'enhancement', 'documentation']),
  priority: z.enum(['low', 'medium', 'high']),
  estimatedHours: z.number().min(0),
  archived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Export type for use in components
export type TaskFromSchema = z.infer<typeof taskSchema>;

// Adapter configuration schema
const adapterConfigSchema = {
  tableName: 'shadcn_tasks',
  primaryKey: 'id',
  schema: taskSchema,
};

export class AdapterFactory {
  static async create<TSchema = Task>(config: AdapterConfig): Promise<DatabaseAdapter<TSchema>> {
    switch (config.type) {
      case 'drizzle': {
        const { DrizzleAdapter } = await import('./drizzle-adapter');
        return new DrizzleAdapter<TSchema>(config) as DatabaseAdapter<TSchema>;
      }
      case 'supabase': {
        const { SupabaseAdapter } = await import('./supabase-adapter');
        return new SupabaseAdapter<TSchema>(config) as DatabaseAdapter<TSchema>;
      }
      default:
        throw new Error(`Unsupported adapter type: ${(config as any).type}`);
    }
  }
}

export async function createTaskAdapter(adapterType?: 'drizzle' | 'supabase'): Promise<DatabaseAdapter<Task>> {
  // Check environment variable first, then fall back to parameter, then default to drizzle
  const adapter = process.env.DATABASE_ADAPTER || adapterType || 'drizzle';
  
  if (adapter === 'supabase') {
    return createSupabaseAdapter();
  }
  
  return createDrizzleAdapter();
}

async function createDrizzleAdapter(): Promise<DatabaseAdapter<Task>> {
  const { db } = await import('@/db');
  const { tasks } = await import('@/db/schema');

  const config: DrizzleAdapterConfig = {
    type: 'drizzle',
    db,
    table: tasks,
    schema: adapterConfigSchema,
  };

  return AdapterFactory.create<Task>(config);
}

async function createSupabaseAdapter(): Promise<DatabaseAdapter<Task>> {
  const { createClient } = await import('@supabase/supabase-js');
  const { env } = await import('@/env.js');

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required for Supabase adapter');
  }
  
  const client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

  const config: SupabaseAdapterConfig = {
    type: 'supabase',
    client,
    schema: adapterConfigSchema,
  };

  return AdapterFactory.create<Task>(config);
}