import { execSync } from 'child_process';
import path from 'path';
import os from 'os';

export function resetDb() {
  const apiDir = path.resolve(__dirname, '../../../../apps/api');
  const npx = os.platform() === 'win32' ? 'npx.cmd' : 'npx';
  try {
    // Just push schema to ensure it matches, skip generate
    execSync(`${npx} prisma db push --force-reset --skip-generate`, {
      cwd: apiDir,
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL || (process.env.CI ? 'postgresql://postgres:postgres@localhost:5432/usability_db_test?schema=public' : 'postgresql://postgres:postgres@localhost:5433/usability_db_test?schema=public')
      }
    });
  } catch (error) {
    console.error('Failed to reset DB', error);
  }
}
