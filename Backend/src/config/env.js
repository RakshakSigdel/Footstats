import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../../.env');

// Load environment variables
dotenv.config({ path: envPath });

const sanitizeEnvValue = (value) =>
  String(value || "")
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1");

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
  jwtSecret: sanitizeEnvValue(process.env.JWT_SECRET),
  databaseUrl: sanitizeEnvValue(process.env.DATABASE_URL),
  frontendUrl: sanitizeEnvValue(process.env.FRONTEND_URL) || "http://localhost:5173",
  emailUser: sanitizeEnvValue(process.env.EMAIL_USER),
  emailPassword: sanitizeEnvValue(process.env.EMAIL_PASSWORD),
  googleClientId: sanitizeEnvValue(process.env.GOOGLE_CLIENT_ID),
};
