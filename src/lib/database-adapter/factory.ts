import type { Task } from "@/db/schema";
import { DrizzleAdapter } from "./drizzle-adapter";
import type { AdapterConfig, DatabaseAdapter } from "./types";

export class AdapterFactory {
  static create<TSchema = Task>(config: AdapterConfig): DatabaseAdapter<TSchema> {
    switch (config.type) {
      case 'drizzle':
        return new DrizzleAdapter<TSchema>(config) as DatabaseAdapter<TSchema>;
      case 'supabase':
        throw new Error('Supabase adapter not yet implemented');
      default:
        throw new Error(`Unsupported adapter type: ${(config as any).type}`);
    }
  }
}

export async function createTaskAdapter(): Promise<DatabaseAdapter<Task>> {
  // Dynamic imports to avoid circular dependencies
  const { db } = await import('@/db');
  const { tasks } = await import('@/db/schema');
  
  const config: AdapterConfig = {
    type: 'drizzle',
    db,
    table: tasks,
    schema: {
      tableName: 'tasks',
      primaryKey: 'id',
      columns: {
        id: { type: 'string' },
        code: { type: 'string' },
        title: { type: 'string', nullable: true },
        status: { type: 'string', enum: ['todo', 'in-progress', 'done', 'canceled'] },
        label: { type: 'string', enum: ['bug', 'feature', 'enhancement', 'documentation'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        estimatedHours: { type: 'number' },
        archived: { type: 'boolean' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },
  };

  return AdapterFactory.create<Task>(config);
}