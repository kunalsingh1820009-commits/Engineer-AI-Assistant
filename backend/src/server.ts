import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';
import { initDatabase } from './database/schema.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server & production ports
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

async function startServer() {
  try {
    console.log('Initializing Engineer AI Database...');
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Engineer AI Assistant Backend running at http://localhost:${PORT}`);
      console.log(`📡 API Base Endpoint: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
