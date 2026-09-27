import express from 'express';
import cors from 'cors';

import { authRoutes } from './routes/auth';
import { campaignRoutes } from './routes/campaigns';
import { jobRoutes } from './routes/jobs';
import path from 'path';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/auth', authRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/jobs', jobRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});
