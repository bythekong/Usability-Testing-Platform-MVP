import express from 'express';
import cors from 'cors';

import { authRoutes } from './routes/auth';
import { campaignRoutes } from './routes/campaigns';
import { jobRoutes } from './routes/jobs';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/auth', authRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/jobs', jobRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});
