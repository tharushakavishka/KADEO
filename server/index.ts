import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB, getDbStatus } from './db';
import { seedDatabaseIfEmpty } from './seed';
import { authRouter } from './routes/auth';
import { shopsRouter } from './routes/shops';
import { productsRouter } from './routes/products';
import { ordersRouter } from './routes/orders';
import { categoriesRouter } from './routes/categories';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & CORS Configuration
const allowedOrigins = [
  process.env.APP_URL,
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server) or matching allowed origins
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true); // Fallback to permissive if origin is same-host
      }
    },
    credentials: true,
  })
);

// Increased Body Parser Limit to 10MB to support Base64 images and hero media uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Status & MongoDB Health Check
app.get('/api/health', (_req, res) => {
  const status = getDbStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      type: 'MongoDB Atlas',
      connected: status.connected,
      readyState: status.readyState,
      name: status.name,
      host: status.host,
    },
  });
});

// Mount API Routes
app.use('/api/auth', authRouter);
app.use('/api/shops', shopsRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/categories', categoriesRouter);

// Production Static Serving and SPA Wildcard Fallback
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  // Do not intercept API requests
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      next();
    }
  });
});

// Start server
const startServer = async () => {
  const connected = await connectDB();
  if (connected) {
    await seedDatabaseIfEmpty();
  }

  app.listen(PORT, () => {
    console.log(`🚀 [Kadeo Express API] Listening on port ${PORT}`);
    console.log(`📡 [Health Endpoint] http://localhost:${PORT}/api/health`);
  });
};

startServer();
