import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { requireAuth } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/errors.js';
import { asyncHandler } from './utils/asyncHandler.js';
import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientOrigins }));
app.use(express.json({ limit: '100kb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get(
  '/health/db',
  asyncHandler(async (req, res) => {
    await pool.query('select 1');
    res.json({ status: 'ok', database: 'connected' });
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/me', requireAuth, meRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}`);
});
