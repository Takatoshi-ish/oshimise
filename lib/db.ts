import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg';

const g = globalThis as unknown as { __pgPool?: Pool };

export const pool: Pool =
  g.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== 'production') {
  g.__pgPool = pool;
}

export function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params as never[]);
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
