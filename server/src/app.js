// src/app.js - Express app only (no server, no WebSocket, no cron)
// This file is used by both server.js (production) and Supertest (testing)

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { initRoutes } from './routes/index.js';

const app = express();

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_ADMIN_URL || 'http://localhost:3000',
  process.env.CLIENT_CUSTOMER_URL || 'http://localhost:5501',
  'http://localhost:5000',
  'http://127.0.0.1',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Key', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 204,
}));

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/product-images', express.static(path.join(process.cwd(), 'backend', 'product')));

// Routes
initRoutes(app);

export default app;
