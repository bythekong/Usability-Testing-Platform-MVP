import { execSync } from 'child_process';
import path from 'path';
import os from 'os';

export function resetDb() {
  const apiDir = path.resolve(__dirname, '../../../../apps/api');
  const dbUrl = process.env.DATABASE_URL || (process.env.CI ? 'postgresql://postgres:postgres@localhost:5432/usability_db_test?schema=public' : 'postgresql://postgres:postgres@localhost:5433/usability_db_test?schema=public');
  
  try {
    // Instead of db push --force-reset which drops the schema and kills the API server's connection pool,
    // we use a node script to connect and truncate tables.
    const script = `
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient({ datasources: { db: { url: '${dbUrl}' } } });
      async function wipe() {
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "User", "TestCampaign", "Task", "JobAssignment", "TaskResponse" CASCADE;');
        await prisma.$disconnect();
      }
      wipe().catch(console.error);
    `;
    const fs = require('fs');
    const scriptPath = path.join(apiDir, 'wipe.js');
    fs.writeFileSync(scriptPath, script);
    
    execSync('node wipe.js', {
      cwd: apiDir,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('Failed to reset DB', error);
  }
}
