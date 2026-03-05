import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.SUPABASE_DB_URL;
console.log(`Testing connection to: ${connectionString.replace(/:[^:@]*@/, ':***@')}`);

const sql = postgres(connectionString);

async function testConnection() {
  try {
    const result = await sql`SELECT version()`;
    console.log('Connection successful!');
    console.log('Postgres version:', result[0].version);
  } catch (error) {
    console.error('Connection failed:', error.message);
  } finally {
    process.exit();
  }
}

testConnection();
