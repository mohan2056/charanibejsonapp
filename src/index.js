import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import candidateRoutes from './routes/candidateRoutes.js';
import examRoutes from './routes/examRoutes.js';

const app = express();
const PORT = process.env.PORT || 8080;

// ============================================
// MIDDLEWARE
// ============================================

// CORS Configuration
app.use(
  cors({
    origin: [
      'https://charanionlineexam.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*'],
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  })
);

// ============================================
// ROUTES
// ============================================

// Candidate routes
app.use('/api/candidate', candidateRoutes);

// Exam routes
app.use('/api', examRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Online Exam JSON API',
    version: '1.0.0',
    endpoints: {
      candidate: {
        register: 'POST /api/candidate/register',
        getAllCandidates: 'GET /api/candidate/all',
      },
      exam: {
        getQuestions: 'GET /api/questions/:section?email=user@example.com',
        submitExam: 'POST /api/result/submit',
        searchResults: 'GET /api/result/search?email=...&minPercentage=...',
        getResultByEmail: 'GET /api/result/email/:email',
      },
      health: 'GET /api/health',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║    Online Exam JSON API Server        ║
║          Running on :${PORT}           ║
╚════════════════════════════════════════╝
  `);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Access: http://localhost:${PORT}`);
});

export default app;
