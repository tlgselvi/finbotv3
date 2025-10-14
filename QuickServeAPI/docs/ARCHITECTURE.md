# 🏗️ FinBot v3 - Sistem Mimarisi ve Güvenlik

**Son Güncelleme:** 2025-10-14  
**Versiyon:** 3.0 Enterprise+++

---

## 📐 SİSTEM MİMARİSİ

### Genel Yapı

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                    │
│  • React 18 + TypeScript                                    │
│  • Tailwind CSS + Radix UI                                  │
│  • TanStack Query (React Query)                             │
│  • Wouter (Routing)                                         │
│  • Recharts (Charts)                                        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/HTTPS + JWT
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  API LAYER (Express)                         │
│  • Express.js                                                │
│  • JWT Authentication                                        │
│  • Rate Limiting                                             │
│  • CORS + Helmet                                             │
│  • Request Validation                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               BUSINESS LOGIC LAYER                           │
│  • Modules/                                                  │
│    ├── Accounts                                              │
│    ├── Transactions                                          │
│    ├── Budgets                                               │
│    ├── Dashboard (Runway, Cash Gap, DSCR)                   │
│    ├── Consolidation                                         │
│    ├── Scenario                                              │
│    ├── Advisor (AI-powered recommendations)                 │
│    └── Simulation (Monte Carlo)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              DATA ACCESS LAYER (Drizzle ORM)                 │
│  • Drizzle ORM                                               │
│  • Type-safe queries                                         │
│  • Migration management                                      │
│  • Connection pooling                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         DATABASE (PostgreSQL Only)                           │
│  • PostgreSQL (Production & Development)                     │
│  • SSL/TLS Connection (Render.com)                           │
│  • Automated backups                                         │
│  • Point-in-time recovery                                    │
│  • Connection pooling                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         CACHE LAYER (Redis + Memory Fallback)                │
│  • Redis (Primary cache)                                     │
│  • Memory Cache (Fallback when Redis unavailable)           │
│  • LLM Cache (Prompt caching with TTL)                      │
│  • Session management                                        │
│  • Auto-failover mechanism                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         CTO KOÇU V3 ENTERPRISE+++                            │
│  • 60+ Commands                                              │
│  • Plugin System (Sandbox execution)                         │
│  • Async Task Worker (Job queue)                             │
│  • Autonomous Learning Layer                                  │
│  • Predictive Maintenance                                     │
│  • Governance/Approval Mode                                   │
│  • Security Sandbox                                           │
│  • Context Awareness 2.0                                      │
│  • Auto-Debug Engine                                          │
│  • Enhanced Visualization                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ PROJE YAPISI

```
QuickServeAPI/
├── client/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   └── main.tsx        # Entry point
│   ├── public/             # Static assets
│   └── vite.config.ts      # Vite configuration
│
├── server/                  # Backend (Express + TypeScript)
│   ├── index.ts            # Server entry point
│   ├── db.ts               # Database connection
│   ├── vite.ts             # Vite dev server integration
│   │
│   ├── routes/             # API routes
│   │   ├── accounts.ts
│   │   ├── transactions.ts
│   │   ├── budgets.ts
│   │   ├── dashboard.ts
│   │   └── ...
│   │
│   ├── modules/            # Business logic
│   │   ├── account/
│   │   ├── transaction/
│   │   ├── budget/
│   │   ├── dashboard/
│   │   │   ├── runway-cashgap.ts
│   │   │   ├── dscr.ts
│   │   │   └── consolidation.ts
│   │   ├── advisor/
│   │   ├── simulation/
│   │   └── ...
│   │
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts         # Authentication
│   │   ├── security.ts     # Security headers
│   │   ├── audit.ts        # Audit logging
│   │   └── ...
│   │
│   └── services/           # External services
│       ├── ai-persona-service.ts
│       ├── email-service.ts
│       └── ...
│
├── shared/                  # Shared code
│   ├── schema-sqlite.ts    # SQLite schema
│   └── types.ts            # Shared types
│
├── tests/                   # Test files
│   ├── business/           # Business logic tests
│   ├── dashboard/          # Dashboard tests
│   ├── integration/        # Integration tests
│   ├── e2e/                # E2E tests
│   ├── security/           # Security tests
│   └── setup/              # Test setup
│
├── scripts/                 # Automation scripts
│   ├── phase1-runner.js
│   ├── smart-test-runner.js
│   ├── coverage-analyzer.js
│   └── ...
│
├── docs/                    # Documentation
│   └── API_CONTRACT.md
│
├── migrations/             # Database migrations
├── reports/                # Generated reports
├── backups/                # Backup files
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── drizzle.config.ts
└── .env
```

---

## 🔐 GÜVENLİK MİMARİSİ

### Katmanlı Güvenlik

```
┌───────────────────────────────────────────────┐
│  1. Network Layer (HTTPS + CORS)              │
├───────────────────────────────────────────────┤
│  2. Application Layer (Helmet + Rate Limit)   │
├───────────────────────────────────────────────┤
│  3. Authentication (JWT + 2FA)                │
├───────────────────────────────────────────────┤
│  4. Authorization (Role-Based Permissions)    │
├───────────────────────────────────────────────┤
│  5. Data Layer (SQL Injection Prevention)     │
├───────────────────────────────────────────────┤
│  6. Audit Layer (Activity Logging)            │
└───────────────────────────────────────────────┘
```

---

### 1. Authentication & Authorization

**JWT Token System:**

```typescript
// Access Token (15 min)
{
  userId: string,
  role: 'USER' | 'ADMIN' | 'MANAGER',
  familyId: string,
  exp: timestamp
}

// Refresh Token (7 days)
{
  userId: string,
  familyId: string,
  tokenVersion: number,
  exp: timestamp
}
```

**Token Rotation:**

- Access token: 15 dakika
- Refresh token: 7 gün
- Automatic refresh before expiry
- Revoked tokens database

**2FA Support:**

- TOTP (Time-based OTP)
- SMS verification
- Backup codes

---

### 2. Password Security

**Hashing:**

```typescript
// Argon2id (recommended)
import argon2 from 'argon2';

const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
});
```

**Password Policy:**

- Minimum 8 characters
- At least 1 uppercase
- At least 1 lowercase
- At least 1 number
- At least 1 special character
- No common passwords (dictionary check)

---

### 3. Security Headers

**Helmet Configuration:**

```typescript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
```

---

### 4. Rate Limiting

**API Rate Limits:**

```typescript
// General API
rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

// Login endpoint
rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts
  skipSuccessfulRequests: true,
});

// Password reset
rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
});
```

---

### 5. Input Validation

**Request Validation:**

```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Express validator
import { body, validationResult } from 'express-validator';

app.post(
  '/api/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors });
    }
    // Process login
  }
);
```

**SQL Injection Prevention:**

```typescript
// ✅ DOĞRU: Parameterized queries (Drizzle ORM)
await db.select().from(users).where(eq(users.email, email));

// ❌ YANLIŞ: String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

**XSS Prevention:**

```typescript
// Content Security Policy (CSP)
// HTML sanitization
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirtyHTML);

// React automatic escaping
<div>{userInput}</div> // Safe
<div dangerouslySetInnerHTML={{__html: userInput}} /> // Dangerous!
```

---

### 6. Audit Logging

**Activity Tracking:**

```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string; // 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE'
  resource: string; // 'account' | 'transaction' | 'budget'
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: object;
}
```

**Tracked Events:**

- User login/logout
- Failed login attempts
- Password changes
- Data modifications (CRUD)
- Permission changes
- API requests (critical endpoints)

---

## 🔒 OTOMATIK GÜVENLİK KONTROLLER

### Git Push Hooks (Otomatik)

**Her `git push` sonrası:**

```bash
[1/6] 🔐 Secret Tarama
      ✅ 248 dosya tarandı
      ✅ 0 secret tespit edildi

[2/6] 🔒 Security Scan (SAST)
      ✅ SQL injection: Pass
      ✅ XSS vulnerabilities: Pass
      ✅ Path traversal: Pass

[3/6] ⚖️ License Audit
      ✅ 0 problematic licenses
      ✅ All dependencies safe

[4/6] 🛡️ Dependency Audit
      ✅ 0 known vulnerabilities
      ✅ All dependencies up-to-date

[5/6] 🧪 Security Tests
      ✅ Authentication tests: Pass
      ✅ Authorization tests: Pass
      ✅ JWT tests: Pass

[6/6] 🔍 Migration Guard
      ✅ No destructive migrations
      ✅ Database safe
```

---

### Manuel Güvenlik Komutları

```bash
# Secret tarama
pnpm sec:secrets

# SAST security scan
pnpm sec:sast

# License audit
pnpm sec:license

# SBOM generation
pnpm sbom:gen

# Dependency audit
pnpm audit

# Security test suite
pnpm test:security
```

---

## 📊 MONITORING & LOGGING

### Log Levels

```typescript
// Pino logger
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// Usage
logger.debug('Debug message'); // Development
logger.info('Info message'); // General info
logger.warn('Warning message'); // Warnings
logger.error('Error message'); // Errors
logger.fatal('Fatal message'); // Critical errors
```

---

### Error Handling

```typescript
// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Don't expose stack trace in production
  res.status(500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
});
```

---

### Health Monitoring

**Health Check Endpoint:**

```typescript
app.get('/api/health', async (req, res) => {
  try {
    // Database check
    await db.execute(sql`SELECT 1`);

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      database: 'connected',
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});
```

---

## 🚀 PERFORMANCE OPTİMİZASYONU

### Database

**Connection Pooling:**

```typescript
const pool = {
  max: 20, // Maximum connections
  min: 5, // Minimum connections
  idle: 10000, // Idle timeout (10s)
  acquire: 30000, // Acquire timeout (30s)
  evict: 60000, // Eviction interval (60s)
};
```

**Query Optimization:**

- Indexes on frequently queried columns
- Prepared statements
- Query result caching
- Batch operations

---

### API

**Response Caching:**

```typescript
import cache from 'apicache';

// Cache for 5 minutes
app.get('/api/dashboard', cache.middleware('5 minutes'), dashboardController);

// Clear cache on updates
cache.clear('/api/dashboard');
```

**Compression:**

```typescript
import compression from 'compression';

app.use(
  compression({
    level: 6,
    threshold: 1024, // Only compress responses > 1KB
  })
);
```

---

### Frontend

**Code Splitting:**

```typescript
// Lazy loading
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Route-based splitting
<Suspense fallback={<Loading />}>
  <Route path="/dashboard" component={Dashboard} />
</Suspense>
```

**Asset Optimization:**

- Image compression
- Lazy image loading
- Tree shaking
- Minification
- Gzip compression

---

## 🔄 DATA FLOW

### User Login Flow

```
1. User submits credentials
   ↓
2. Server validates input
   ↓
3. Check rate limit (5 attempts/15min)
   ↓
4. Query user from database
   ↓
5. Verify password (Argon2)
   ↓
6. Generate JWT tokens
   ↓
7. Store refresh token in database
   ↓
8. Log audit event
   ↓
9. Return tokens to client
   ↓
10. Client stores in memory (not localStorage)
```

---

### API Request Flow

```
1. Client sends request with JWT
   ↓
2. CORS middleware checks origin
   ↓
3. Security headers (Helmet)
   ↓
4. Rate limiting check
   ↓
5. JWT verification
   ↓
6. User authorization check
   ↓
7. Input validation
   ↓
8. Business logic execution
   ↓
9. Database operation
   ↓
10. Response formatting
    ↓
11. Audit logging
    ↓
12. Send response
```

---

## 📖 BEST PRACTICES

### Security

- ✅ Always use HTTPS in production
- ✅ Never store secrets in code
- ✅ Use environment variables
- ✅ Validate all inputs
- ✅ Sanitize all outputs
- ✅ Use parameterized queries
- ✅ Implement rate limiting
- ✅ Log security events
- ✅ Keep dependencies updated
- ✅ Regular security audits

---

### Performance

- ✅ Use connection pooling
- ✅ Cache frequently accessed data
- ✅ Compress responses
- ✅ Optimize database queries
- ✅ Use indexes
- ✅ Batch operations
- ✅ Lazy load components
- ✅ Code splitting
- ✅ Monitor performance metrics

---

### Reliability

- ✅ Implement health checks
- ✅ Use try-catch blocks
- ✅ Log errors properly
- ✅ Handle edge cases
- ✅ Validate data types
- ✅ Use TypeScript strict mode
- ✅ Write comprehensive tests
- ✅ Automate deployments
- ✅ Database backups
- ✅ Rollback strategy

---

## 📚 DAHA FAZLA BİLGİ

- **Komutlar:** `COMMANDS.md`
- **Test Dokümantasyonu:** `TESTING.md`
- **Deployment Rehberi:** `DEPLOYMENT.md`
- **API Dokümantasyonu:** `API_DOCUMENTATION.md`
