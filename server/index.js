import express from 'express';
import cors from 'cors';
import clientsRouter from './routes/clients.js';
import onboardingRouter from './routes/onboarding.js';
import refRouter from './routes/ref.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/clients', clientsRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/ref', refRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`API server → http://localhost:${PORT}`);
});
