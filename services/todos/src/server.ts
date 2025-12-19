import express from 'express';
import cors from 'cors';
import { RegisterRoutes } from './routes/routes';
import { errorHandler } from './middleware/error-handler';

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Register TSOA routes
  RegisterRoutes(app);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}
