import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import segmentRoutes from './routes/segments';
import customerRoutes from './routes/customers';
import errorHandler from './middleware/errorHandler';
import pool from './config/database';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'chainreach-segmentation-agent-node',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Status endpoint with database check
app.get('/status', async (_req: Request, res: Response) => {
  try {
    const dbCheck = await pool.query('SELECT NOW() as time, COUNT(*) as customer_count FROM customers');
    const segmentCheck = await pool.query('SELECT COUNT(*) as segment_count FROM segments');
    
    res.json({
      status: 'healthy',
      service: 'chainreach-segmentation-agent-node',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: true,
        timestamp: dbCheck.rows[0].time,
        customers: parseInt(dbCheck.rows[0].customer_count),
        segments: parseInt(segmentCheck.rows[0].segment_count),
      },
      ai_enabled: process.env.AZURE_OPENAI_ENDPOINT ? true : false,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'chainreach-segmentation-agent-node',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: 'Database connection failed',
      },
    });
  }
});

// Metrics endpoint for monitoring
app.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(DISTINCT segment_id) as active_segments,
        AVG(engagement_score)::numeric(10,2) as avg_engagement,
        SUM(total_purchases)::numeric(10,2) as total_revenue,
        COUNT(CASE WHEN segment_id IS NULL THEN 1 END) as unassigned_customers
      FROM customers
    `);
    
    const segmentStats = await pool.query(`
      SELECT s.id, s.name, COUNT(c.customer_id) as customer_count
      FROM segments s
      LEFT JOIN customers c ON s.id = c.segment_id
      GROUP BY s.id, s.name
      ORDER BY s.id
    `);
    
    res.json({
      timestamp: new Date().toISOString(),
      summary: {
        total_customers: parseInt(stats.rows[0].total_customers),
        active_segments: parseInt(stats.rows[0].active_segments),
        avg_engagement_score: parseFloat(stats.rows[0].avg_engagement),
        total_revenue: parseFloat(stats.rows[0].total_revenue),
        unassigned_customers: parseInt(stats.rows[0].unassigned_customers),
      },
      segments: segmentStats.rows.map((row: any) => ({
        segment_id: row.id,
        segment_name: row.name,
        customer_count: parseInt(row.customer_count),
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'ChainReach AI Segmentation Agent',
    version: '1.0.0',
    description: 'Customer segmentation API with AI-powered insights',
    endpoints: {
      health: 'GET /health',
      status: 'GET /status',
      metrics: 'GET /metrics',
      segments: 'GET /api/segments',
      segment_by_id: 'GET /api/segments/:id?limit=100',
      customers: 'GET /api/customers',
      customers_by_segment: 'GET /api/customers?segment_id={id}',
      analyze: 'POST /api/segment/analyze',
      refresh: 'POST /api/segment/refresh',
    },
    documentation: 'https://github.com/nermeennasim/chainreach-ai',
  });
});

// API routes
app.use('/api', segmentRoutes);
app.use('/api', customerRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Global error handler
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '8000', 10);


// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(' ========================================');
  console.log(` ChainReach Segmentation Agent Started`);
  console.log(' ========================================');
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(` API docs: http://localhost:${PORT}/`);
  console.log(' ========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
