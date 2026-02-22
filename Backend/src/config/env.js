import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../../.env');

// Load environment variables
dotenv.config({ path: envPath });

// Verify critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ CRITICAL: DATABASE_URL is not defined in .env file');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');

export const config = {
  port: process.env.PORT || 5555,
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
};
