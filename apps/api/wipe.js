
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://postgres:postgres@localhost:5433/usability_db_test?schema=public' } } });
      async function wipe() {
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "User", "TestCampaign", "Task", "JobAssignment", "TaskResponse" CASCADE;');
        await prisma.$disconnect();
      }
      wipe().catch(console.error);
    