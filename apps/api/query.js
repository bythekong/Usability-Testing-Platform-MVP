const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://postgres:postgres@localhost:5433/usability_db_test?schema=public' } } });
prisma.user.findMany().then(console.log).finally(() => prisma.$disconnect());
