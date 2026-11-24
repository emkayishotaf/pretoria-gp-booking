declare module '@vercel/postgres' {
  export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
    command: string;
  }

  export interface VercelPool {
    query: (queryText: string, values?: any[]) => Promise<QueryResult>;
  }

  export function createPool(config?: { connectionString?: string }): VercelPool;
  export const sql: any;
}
