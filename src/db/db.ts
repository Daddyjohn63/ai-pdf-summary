'use server';

import { Pool } from 'pg';

let pool: Pool | null = null;

export async function getDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false
    });
  }

  try {
    // Test the connection
    const client = await pool.connect();
    client.release();
    return pool;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw new Error('Failed to connect to the database');
  }
}
