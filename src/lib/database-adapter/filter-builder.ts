import type { ExtendedColumnFilter, ExtendedColumnSort, JoinOperator } from "@/types/data-table";
import type { FilterBuilder, OrderByClause, SchemaDefinition, WhereClause } from "./types";

export abstract class BaseFilterBuilder<TSchema = any> implements FilterBuilder<TSchema> {
  constructor(protected schema: SchemaDefinition) {}

  abstract buildWhereClause(
    filters: ExtendedColumnFilter<TSchema>[],
    joinOperator: JoinOperator
  ): WhereClause;

  abstract buildOrderByClause(sorts: ExtendedColumnSort<TSchema>[]): OrderByClause;

  protected getColumnType(columnId: string): string {
    return this.schema.columns[columnId]?.type || 'string';
  }

  protected isColumnNullable(columnId: string): boolean {
    return this.schema.columns[columnId]?.nullable ?? false;
  }

  protected getColumnEnum(columnId: string): readonly string[] | undefined {
    return this.schema.columns[columnId]?.enum;
  }

  protected normalizeValue(value: any, columnType: string): any {
    switch (columnType) {
      case 'number':
        return typeof value === 'string' ? Number(value) : value;
      case 'boolean':
        return typeof value === 'string' ? value === 'true' : Boolean(value);
      case 'date':
        return value instanceof Date ? value : new Date(value);
      default:
        return value;
    }
  }

  protected normalizeDateValue(value: string | number): Date {
    const date = new Date(typeof value === 'string' ? Number(value) : value);
    return date;
  }

  protected setDateToStartOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  protected setDateToEndOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }

  protected addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
  }

  protected parseRelativeDate(value: string): { startDate: Date; endDate: Date } | null {
    const [amount, unit] = value.split(' ') || [];
    if (!amount || !unit) return null;

    const today = new Date();
    const numAmount = Number.parseInt(amount);
    let startDate: Date;
    let endDate: Date;

    switch (unit) {
      case 'days':
        startDate = this.setDateToStartOfDay(this.addDays(today, numAmount));
        endDate = this.setDateToEndOfDay(startDate);
        break;
      case 'weeks':
        startDate = this.setDateToStartOfDay(this.addDays(today, numAmount * 7));
        endDate = this.setDateToEndOfDay(this.addDays(startDate, 6));
        break;
      case 'months':
        startDate = this.setDateToStartOfDay(this.addDays(today, numAmount * 30));
        endDate = this.setDateToEndOfDay(this.addDays(startDate, 29));
        break;
      default:
        return null;
    }

    return { startDate, endDate };
  }
}