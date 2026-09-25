import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { Role } from '@usability-testing/shared';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Example route demonstrating shared types usage
app.get('/test-shared', (req, res) => {
  res.json({ role: Role.OWNER });
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
