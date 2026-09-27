import { execSync } from 'child_process';
import path from 'path';

export function resetDb() {
  const apiDir = path.resolve(__dirname, '../../../../apps/api');
  try {
    execSync('npx prisma migrate reset --force', {
      cwd: apiDir,
      stdio: 'ignore',
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/usability_db_test?schema=public'
      }
    });
  } catch (error) {
    console.error('Failed to reset DB', error);
  }
}
