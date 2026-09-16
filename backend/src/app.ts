import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import { errorHandler } from './common/middleware/errorHandler.js';
import { AppError } from './common/errors/AppError.js';
import { swaggerDocument } from './docs/swagger.js';

const app = express();

// Trust the reverse proxy (required for express-rate-limit in cloud environments)
app.set('trust proxy', 1);

// Security Middlewares
app.use(cors());

// Rate Limiting (Basic)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests from this IP, please try again later.' } }
});
app.use('/api', limiter);

// Body & Cookie Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// API Routes
app.use('/api/v1', routes);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root route for preview
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechYad Backend API</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Vazirmatn', sans-serif; }
    </style>
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center p-6">
    <div class="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-6">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-3">تک‌یاد API</h1>
        <p class="text-gray-500 mb-8 leading-relaxed">
            به سرویس بک‌اند پلتفرم آموزش آنلاین تک‌یاد (TechYad) خوش آمدید. تمامی سرویس‌ها در حال اجرا و آماده پاسخگویی هستند.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/api-docs" class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                ورود به مستندات Swagger
            </a>
            <a href="/api/v1/courses" class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200">
                تست API دوره‌ها
            </a>
        </div>
        <div class="mt-10 pt-8 border-t border-gray-100 text-sm text-gray-400">
            نسخه 1.0.0 &bull; معماری Modular Monolith &bull; Node.js & Express
        </div>
    </div>
</body>
</html>
  `);
});

// Handle 404
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404, 'NOT_FOUND'));
});

// Global Error Handler
app.use(errorHandler);

export default app;
