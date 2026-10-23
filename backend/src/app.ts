import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import routes from './routes/index.js';
import { errorHandler } from './common/middleware/errorHandler.js';
import { persianNormalizeMiddleware } from './common/middleware/persianNormalize.js';
import { AppError } from './common/errors/AppError.js';
import { swaggerDocument } from './docs/swagger.js';
import { UPLOADS_ROOT, initUploadDirectories } from './modules/media/storage.config.js';
import { sanitizeProxyHeadersMiddleware, rateLimitKeyGenerator } from './common/utils/ip-sanitizer.js';
import { maintenanceLockMiddleware } from './common/middleware/platform-locks.middleware.js';

initUploadDirectories();

const app = express();

// Trust the reverse proxy (required for express-rate-limit in cloud environments / IIS)
app.set('trust proxy', 1);
app.use(sanitizeProxyHeadersMiddleware);

// Security Middlewares - CORS configured to allow Port 4000, Port 3000, and standard client apps
const allowedOrigins = [
  'http://localhost:4000',
  'http://127.0.0.1:4000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://62.220.123.21:4000',
  'http://62.220.123.21:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Explicitly allow port 4000, port 3000, and configured origins
    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.includes(':4000') ||
      origin.includes(':3000') ||
      process.env.NODE_ENV !== 'production';

    if (isAllowed) {
      return callback(null, true);
    }
    // Fallback in development/preview to allow the requesting origin with credentials
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Hide-Error-Toast', 'Accept'],
  exposedHeaders: ['Set-Cookie']
}));

// Rate Limiting (Protected against brute-force attacks while allowing seamless platform browsing)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3000, // Generous limit for normal dashboard navigation and active platform users
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: rateLimitKeyGenerator,
  validate: { xForwardedForHeader: false },
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'درخواست‌های بیش از حد از این IP ثبت شده است. لطفاً کمی بعد دوباره تلاش کنید.' } }
});
app.use('/api', globalLimiter);

// Specific brute-force protection for sensitive auth endpoints (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per 15 minutes per IP for login/register
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: rateLimitKeyGenerator,
  validate: { xForwardedForHeader: false },
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'تعداد دفعات تلاش برای ورود یا ثبت‌نام بیش از حد مجاز بوده است. لطفاً ۱۵ دقیقه دیگر تلاش کنید.' } }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// Dedicated OTP SMS Rate Limiter to prevent SMS credit exhaustion
const otpLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5, // 5 OTP requests per 2 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: rateLimitKeyGenerator,
  validate: { xForwardedForHeader: false },
  message: { success: false, error: { code: 'OTP_RATE_LIMITED', message: 'درخواست‌های ارسال کد تأیید بیش از حد مجاز است. لطفاً ۲ دقیقه دیگر تلاش کنید.' } }
});
app.use('/api/auth/send-otp', otpLimiter);
app.use('/api/auth/verify-otp', otpLimiter);
app.use('/api/v1/auth/send-otp', otpLimiter);
app.use('/api/v1/auth/verify-otp', otpLimiter);

// Body & Cookie Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(persianNormalizeMiddleware);

// Serve static uploads folder with auto-sync from production storage if file is in DB but not local
const staticUploadsMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  next();
};

const uploadsProxyFallback = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const cleanPath = req.path.replace(/^\/+/, '');
  if (!cleanPath) return next();
  const localFilePath = path.join(UPLOADS_ROOT, cleanPath);
  if (fs.existsSync(localFilePath)) {
    return res.sendFile(localFilePath);
  }

  // Fallback to production storage on tecyad.ir for media files existing in DB
  const remoteUrl = `https://tecyad.ir/uploads/${cleanPath}`;
  try {
    const upstream = await axios.get(remoteUrl, { responseType: 'stream', timeout: 5000 });
    const contentType = String(upstream.headers['content-type'] || 'image/webp');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const dir = path.dirname(localFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const writeStream = fs.createWriteStream(localFilePath);
    upstream.data.pipe(writeStream);
    upstream.data.pipe(res);
  } catch {
    next();
  }
};

app.use('/uploads', staticUploadsMiddleware, express.static(UPLOADS_ROOT), uploadsProxyFallback);
app.use('/api/uploads', staticUploadsMiddleware, express.static(UPLOADS_ROOT), uploadsProxyFallback);
app.use('/api/v1/uploads', staticUploadsMiddleware, express.static(UPLOADS_ROOT), uploadsProxyFallback);

// Platform Emergency Locks & Maintenance Middleware
app.use(maintenanceLockMiddleware);

// Official production API route without /v1 prefix
app.use('/api', routes);
// Backwards compatibility for legacy clients/tools
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
    <title>Tecyad Backend API</title>
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
        <h1 class="text-3xl font-bold text-gray-900 mb-3">تک یاد API</h1>
        <p class="text-gray-500 mb-8 leading-relaxed">
            به سرویس بک‌اند پلتفرم آموزش آنلاین تک یاد (Tecyad) خوش آمدید. تمامی سرویس‌ها در حال اجرا و آماده پاسخگویی هستند.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/api-docs" class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                ورود به مستندات Swagger
            </a>
            <a href="/api/courses" class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200">
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
