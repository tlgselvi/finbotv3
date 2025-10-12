/**
 * Test Setup Configuration
 * Global test configuration and mock setup
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import {
  testDb,
  resetDatabase,
  seedTestData,
  closeDatabase,
} from './test-db.js';
import '@testing-library/jest-dom/vitest';

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
  // Don't set DATABASE_URL - let integration tests skip if no real DB
  // process.env.DATABASE_URL = ':memory:';
  process.env.CORS_ORIGIN = 'http://localhost:3000';
  process.env.PORT = '3001';

  // Initialize test database for unit tests
  resetDatabase();
  seedTestData();
});

afterAll(() => {
  // Cleanup after all tests
  vi.clearAllMocks();
  closeDatabase();
});

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  vi.clearAllMocks();
});

// Global mocks for common dependencies
// Use real test database instead of mock
vi.mock('../../server/db.js', async () => {
  const schema = await import('../../shared/schema-sqlite.js');
  return {
    db: testDb,
    ...schema,
  };
});

vi.mock('bcryptjs', () => {
  const mockBcrypt = {
    hash: vi.fn((password: string) => Promise.resolve(`hashed_${password}`)),
    hashSync: vi.fn((password: string) => `hashed_${password}`),
    compare: vi.fn((password: string, hash: string) =>
      Promise.resolve(hash === `hashed_${password}`)
    ),
    compareSync: vi.fn(
      (password: string, hash: string) => hash === `hashed_${password}`
    ),
  };
  return {
    default: mockBcrypt,
    ...mockBcrypt,
  };
});

vi.mock('argon2', () => {
  const mockArgon2 = {
    hash: vi.fn((password: string) => Promise.resolve(`argon2_${password}`)),
    verify: vi.fn((hash: string, password: string) =>
      Promise.resolve(hash === `argon2_${password}`)
    ),
    argon2id: 2, // Argon2id type constant
    argon2i: 1,
    argon2d: 0,
  };
  return {
    default: mockArgon2,
    ...mockArgon2,
  };
});

vi.mock('jsonwebtoken', () => {
  const mockSign = vi.fn(
    (payload: any) => `mock.jwt.token.${JSON.stringify(payload)}`
  );
  const mockVerify = vi.fn((token: string) => {
    const parts = token.split('.');
    if (parts.length === 3) {
      try {
        return JSON.parse(parts[2]);
      } catch {
        return null;
      }
    }
    return null;
  });

  return {
    default: {
      sign: mockSign,
      verify: mockVerify,
    },
    sign: mockSign,
    verify: mockVerify,
  };
});

vi.mock('nodemailer', () => {
  const mockNodemailer = {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn(() => Promise.resolve({ messageId: 'test-message-id' })),
      verify: vi.fn(() => Promise.resolve(true)),
    })),
  };
  return {
    default: mockNodemailer,
    ...mockNodemailer,
  };
});

vi.mock('crypto', () => {
  const mockCrypto = {
    randomUUID: vi.fn(() => 'test-uuid-' + Date.now()),
    randomBytes: vi.fn((size: number) => {
      // Create a proper hex string
      const hexString = 'a'.repeat(size * 2);
      // Return an object that behaves like a Buffer
      const mockBuffer = {
        toString: (encoding?: string) => {
          if (encoding === 'hex') {
            return hexString;
          }
          return 'test-buffer';
        },
        length: size,
        // Add other Buffer methods if needed
        slice: () => mockBuffer,
        copy: () => size,
      };
      return mockBuffer as any;
    }),
    createHmac: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn((encoding?: string) => {
        if (encoding === 'hex') {
          return 'test-hmac-hash-hex';
        }
        return Buffer.from('test-hash');
      }),
    })),
    createHash: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn((encoding?: string) => {
        if (encoding === 'hex') {
          return 'test-hash-hex';
        }
        return Buffer.from('test-hash');
      }),
    })),
    timingSafeEqual: vi.fn(() => true),
    pbkdf2Sync: vi.fn(() => Buffer.from('test-derived-key')),
  };
  return {
    default: mockCrypto,
    ...mockCrypto,
  };
});

// Mock external APIs
global.fetch = vi.fn((url: string, options?: any) => {
  const response = {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: vi.fn(() => Promise.resolve({ success: true })),
    text: vi.fn(() => Promise.resolve('mock response')),
    blob: vi.fn(() => Promise.resolve(new Blob(['mock response']))),
    arrayBuffer: vi.fn(() => Promise.resolve(new ArrayBuffer(0))),
    formData: vi.fn(() => Promise.resolve(new FormData())),
    clone: vi.fn(() => response),
    headers: new Headers({
      'content-type': 'application/json',
      'x-request-id': 'test-request-id',
    }),
    redirected: false,
    type: 'basic' as ResponseType,
    url: typeof url === 'string' ? url : '',
  };
  return Promise.resolve(response as Response);
}) as any;

// Mock file system operations
vi.mock('fs/promises', () => ({
  readFile: vi.fn(() => Promise.resolve('mock file content')),
  writeFile: vi.fn(() => Promise.resolve()),
  unlink: vi.fn(() => Promise.resolve()),
  mkdir: vi.fn(() => Promise.resolve()),
  access: vi.fn(() => Promise.resolve()),
}));

// Mock path operations
vi.mock('path', () => {
  const mockPath = {
    join: vi.fn((...args: string[]) => args.join('/')),
    resolve: vi.fn((...args: string[]) => args.join('/')),
    dirname: vi.fn((path: string) => path.split('/').slice(0, -1).join('/')),
    basename: vi.fn((path: string) => path.split('/').pop() || ''),
    extname: vi.fn((path: string) => {
      const parts = path.split('.');
      return parts.length > 1 ? `.${parts.pop()}` : '';
    }),
    sep: '/',
    delimiter: ':',
  };
  return {
    default: mockPath,
    ...mockPath,
  };
});

// Mock Express
vi.mock('express', () => {
  const mockRouter = vi.fn(() => ({
    use: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    all: vi.fn(),
  }));

  const mockExpress: any = vi.fn(() => ({
    use: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    listen: vi.fn(),
    set: vi.fn(),
  }));

  // Add Router as a method on mockExpress
  mockExpress.Router = mockRouter;
  mockExpress.json = vi.fn(() => (req: any, res: any, next: any) => next());
  mockExpress.urlencoded = vi.fn(
    () => (req: any, res: any, next: any) => next()
  );
  mockExpress.static = vi.fn(() => (req: any, res: any, next: any) => next());

  return {
    default: mockExpress,
    Router: mockRouter,
    json: vi.fn(() => (req: any, res: any, next: any) => next()),
    urlencoded: vi.fn(() => (req: any, res: any, next: any) => next()),
    static: vi.fn(() => (req: any, res: any, next: any) => next()),
  };
});

// Mock Multer
vi.mock('multer', () => {
  const mockMulter: any = vi.fn(() => ({
    single: vi.fn(() => (req: any, res: any, next: any) => next()),
    array: vi.fn(() => (req: any, res: any, next: any) => next()),
    fields: vi.fn(() => (req: any, res: any, next: any) => next()),
  }));

  mockMulter.memoryStorage = vi.fn(() => ({}));
  mockMulter.diskStorage = vi.fn(() => ({}));

  return {
    default: mockMulter,
    memoryStorage: vi.fn(() => ({})),
    diskStorage: vi.fn(() => ({})),
  };
});

// Mock rate limiting
vi.mock('express-rate-limit', () => ({
  default: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

vi.mock('express-slow-down', () => ({
  default: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

// Mock session
vi.mock('express-session', () => ({
  default: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

// Mock CORS
vi.mock('cors', () => ({
  default: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

// Mock Helmet
vi.mock('helmet', () => ({
  default: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

// Mock compression
vi.mock('compression', () => ({
  default: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

// Mock morgan
vi.mock('morgan', () => ({
  default: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

// Mock winston logger
vi.mock('winston', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),
  })),
  format: {
    combine: vi.fn(),
    timestamp: vi.fn(),
    printf: vi.fn(),
    colorize: vi.fn(),
    json: vi.fn(),
  },
  transports: {
    Console: vi.fn(),
    File: vi.fn(),
  },
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      request: vi.fn(() => Promise.resolve({ data: { success: true } })),
      get: vi.fn(() => Promise.resolve({ data: { success: true } })),
      post: vi.fn(() => Promise.resolve({ data: { success: true } })),
      put: vi.fn(() => Promise.resolve({ data: { success: true } })),
      delete: vi.fn(() => Promise.resolve({ data: { success: true } })),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
    request: vi.fn(() => Promise.resolve({ data: { success: true } })),
    get: vi.fn(() => Promise.resolve({ data: { success: true } })),
    post: vi.fn(() => Promise.resolve({ data: { success: true } })),
    put: vi.fn(() => Promise.resolve({ data: { success: true } })),
    delete: vi.fn(() => Promise.resolve({ data: { success: true } })),
  },
}));

// Mock OpenAI
vi.mock('openai', () => ({
  OpenAI: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(() =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: 'Mock AI response',
                },
              },
            ],
          })
        ),
      },
    },
    embeddings: {
      create: vi.fn(() =>
        Promise.resolve({
          data: [
            {
              embedding: new Array(1536).fill(0.1),
            },
          ],
        })
      ),
    },
  })),
}));

// Mock PDF generation
vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn(() =>
      Promise.resolve({
        newPage: vi.fn(() =>
          Promise.resolve({
            setContent: vi.fn(),
            pdf: vi.fn(() => Promise.resolve(Buffer.from('mock pdf'))),
            close: vi.fn(),
          })
        ),
        close: vi.fn(),
      })
    ),
  },
}));

// Mock QR code generation
vi.mock('qrcode', () => ({
  toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,mock-qr-code')),
  toString: vi.fn(() => Promise.resolve('mock-qr-string')),
}));

// Mock 2FA
vi.mock('speakeasy', () => ({
  generateSecret: vi.fn(() => ({
    ascii: 'mock-secret',
    hex: 'mock-hex-secret',
    base32: 'mock-base32-secret',
    otpauth_url: 'mock-otpauth-url',
  })),
  generateToken: vi.fn(() => '123456'),
  verifyToken: vi.fn(() => true),
  totp: {
    verify: vi.fn(() => true),
  },
}));

// Mock CSV parsing
vi.mock('csv-parser', () => ({
  default: vi.fn(() => ({
    on: vi.fn((event: string, callback: Function) => {
      if (event === 'data') {
        callback({ column1: 'value1', column2: 'value2' });
      } else if (event === 'end') {
        callback();
      }
    }),
    write: vi.fn(),
    end: vi.fn(),
  })),
}));

// Mock Excel parsing with exceljs
vi.mock('exceljs', () => ({
  default: {
    Workbook: vi.fn().mockImplementation(() => ({
      addWorksheet: vi.fn().mockReturnValue({
        addRow: vi.fn(),
        getRow: vi.fn().mockReturnValue({
          getCell: vi.fn().mockReturnValue({ value: 'Test' }),
        }),
        columns: [],
      }),
      xlsx: {
        readFile: vi.fn().mockResolvedValue(undefined),
        writeBuffer: vi.fn().mockResolvedValue(Buffer.from('test')),
      },
      worksheets: [
        {
          name: 'Sheet1',
          rowCount: 2,
          getRow: vi.fn().mockReturnValue({
            values: ['Header1', 'Header2'],
          }),
        },
      ],
    })),
  },
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date: Date, format: string) => date.toISOString()),
  parse: vi.fn((dateString: string, format: string) => new Date(dateString)),
  addDays: vi.fn(
    (date: Date, days: number) =>
      new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
  ),
  subDays: vi.fn(
    (date: Date, days: number) =>
      new Date(date.getTime() - days * 24 * 60 * 60 * 1000)
  ),
  isAfter: vi.fn((date1: Date, date2: Date) => date1 > date2),
  isBefore: vi.fn((date1: Date, date2: Date) => date1 < date2),
  differenceInDays: vi.fn((date1: Date, date2: Date) =>
    Math.floor((date1.getTime() - date2.getTime()) / (24 * 60 * 60 * 1000))
  ),
}));

// Mock simple-statistics
vi.mock('simple-statistics', () => ({
  mean: vi.fn((arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length),
  median: vi.fn(
    (arr: number[]) => arr.sort((a, b) => a - b)[Math.floor(arr.length / 2)]
  ),
  standardDeviation: vi.fn((arr: number[]) =>
    Math.sqrt(arr.reduce((a, b) => a + b * b, 0) / arr.length)
  ),
  variance: vi.fn(
    (arr: number[]) => arr.reduce((a, b) => a + b * b, 0) / arr.length
  ),
  linearRegression: vi.fn(() => ({ m: 1, b: 0, r2: 0.95 })),
}));
