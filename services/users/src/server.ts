import express from 'express';
import cors from 'cors';
import { RegisterRoutes } from './routes/routes';
import { errorHandler } from './middleware/error-handler';

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  RegisterRoutes(app);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(errorHandler);

  return app;
}
