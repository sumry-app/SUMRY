import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.routes.js';
import studentsRoutes from './routes/students.routes.js';
import goalsRoutes from './routes/goals.routes.js';
import progressRoutes from './routes/progress.routes.js';

// Import database
import pool from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/progress', progressRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🎓 SUMRY API - Enterprise IEP Management System',
    version: '2.0.0',
    features: [
      '✅ AI-Powered Goal Generation (OpenAI GPT-4)',
      '✅ Role-Based Access Control',
      '✅ Team Collaboration',
      '✅ Progress Tracking & Analytics',
      '✅ Comprehensive Audit Logging',
      '✅ Enterprise Security'
    ],
    documentation: '/api/docs',
    health: '/health'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'GET /api/students',
      'POST /api/students',
      'GET /api/goals/student/:studentId',
      'POST /api/goals/generate-ai',
      'GET /api/progress/goal/:goalId',
      'POST /api/progress',
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // JWT errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }

  // Database errors
  if (err.code && err.code.startsWith('23')) {
    return res.status(409).json({
      error: 'Database Conflict',
      message: 'A database constraint was violated'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ═══════════════════════════════════════════════════════');
  console.log('   SUMRY API Server - Enterprise IEP Management System');
  console.log('   ═══════════════════════════════════════════════════════');
  console.log(`   🌐 Server running on: http://localhost:${PORT}`);
  console.log(`   📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   🤖 AI Features: ${process.env.OPENAI_API_KEY ? 'ENABLED ✅' : 'DISABLED ⚠️'}`);
  console.log(`   🔒 Security: Helmet + CORS + Rate Limiting`);
  console.log(`   📝 Audit Logging: ENABLED`);
  console.log('   ═══════════════════════════════════════════════════════');
  console.log('');
  console.log('   Available endpoints:');
  console.log('   • POST   /api/auth/register');
  console.log('   • POST   /api/auth/login');
  console.log('   • GET    /api/students');
  console.log('   • POST   /api/goals/generate-ai  🤖 AI-Powered!');
  console.log('   • GET    /api/progress/analytics/:studentId');
  console.log('   • GET    /health');
  console.log('');
  console.log('   📚 Ready to serve requests!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});

export default app;
