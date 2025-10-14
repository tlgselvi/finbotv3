import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Optimized PostgreSQL connection with performance settings
const connectionString = process.env.DATABASE_URL || 'postgresql://finbot_user:finbot_dev_pass@localhost:5432/finbot_dev';

const sql = postgres(connectionString, {
    max: 20, // Maximum number of connections
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 10, // Connection timeout
    prepare: false, // Disable prepared statements for better performance
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    transform: {
        undefined: null,
    },
});

export const db = drizzle(sql, { schema });

// Connection health check
export async function checkConnection() {
    try {
        await sql`SELECT 1`;
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}

// Graceful shutdown
export async function closeConnection() {
    await sql.end();
}

export default db;
