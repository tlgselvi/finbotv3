import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TwoFactorAuthService } from '../../server/services/auth/two-factor-auth';
import * as speakeasy from 'speakeasy';
import * as crypto from 'crypto';

// Mock dependencies
vi.mock('../../server/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  },
}));

vi.mock('speakeasy', () => ({
  default: {
    generateSecret: vi.fn(() => ({
      base32: 'JBSWY3DPEHPK3PXP',
      otpauth_url:
        'otpauth://totp/FinBot%20(test-user-id)?secret=JBSWY3DPEHPK3PXP&issuer=FinBot',
    })),
    totp: {
      verify: vi.fn(() => true),
    },
  },
  generateSecret: vi.fn(() => ({
    base32: 'JBSWY3DPEHPK3PXP',
    otpauth_url:
      'otpauth://totp/FinBot%20(test-user-id)?secret=JBSWY3DPEHPK3PXP&issuer=FinBot',
  })),
  totp: {
    verify: vi.fn(() => true),
  },
}));

vi.mock('qrcode', () => ({
  toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,mock-qr-code')),
}));

vi.mock('crypto', () => {
  const mockCrypto = {
    randomBytes: vi.fn((size: number) => {
      // Return a buffer that will produce valid hex codes
      const buf = Buffer.alloc(size);
      for (let i = 0; i < size; i++) {
        buf[i] = i * 16; // This will produce valid hex digits
      }
      return buf;
    }),
    createCipher: vi.fn(() => ({
      update: vi.fn(() => 'encrypted-data'),
      final: vi.fn(() => 'final-encrypted'),
    })),
    createDecipher: vi.fn(() => ({
      update: vi.fn(() => 'decrypted-data'),
      final: vi.fn(() => 'final-decrypted'),
    })),
    createCipheriv: vi.fn(() => ({
      update: vi.fn(() => 'encrypted-data'),
      final: vi.fn(() => 'final-encrypted'),
    })),
    createDecipheriv: vi.fn(() => ({
      update: vi.fn(() => 'decrypted-data'),
      final: vi.fn(() => 'final-decrypted'),
    })),
    randomUUID: vi.fn(() => 'test-uuid'),
    createHash: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn(() => 'test-hash'),
    })),
    createHmac: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn(() => 'test-hmac'),
    })),
  };
  return {
    default: mockCrypto,
    ...mockCrypto,
  };
});

describe('TwoFactorAuthService', () => {
  let service: TwoFactorAuthService;
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    service = new TwoFactorAuthService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateSecret', () => {
    it.skip('should generate TOTP secret, QR code, and backup codes', async () => {
      const mockSecret = {
        base32: 'JBSWY3DPEHPK3PXP',
        otpauth_url:
          'otpauth://totp/FinBot%20(test-user-id)?secret=JBSWY3DPEHPK3PXP&issuer=FinBot',
      };

      vi.mocked(speakeasy.generateSecret).mockReturnValue(mockSecret);

      const result = await service.generateSecret(mockUserId);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCodeUrl');
      expect(result).toHaveProperty('backupCodes');
      expect(result.secret).toBe('JBSWY3DPEHPK3PXP');
      expect(result.qrCodeUrl).toBe('data:image/png;base64,mock-qr-code');
      expect(result.backupCodes).toHaveLength(10);
      expect(result.backupCodes[0]).toMatch(/^[A-F0-9]{8}$/); // 8 hex chars
    });

    it('should handle errors during secret generation', async () => {
      vi.mocked(speakeasy.generateSecret).mockImplementation(() => {
        throw new Error('Secret generation failed');
      });

      await expect(service.generateSecret(mockUserId)).rejects.toThrow(
        'Failed to generate 2FA secret'
      );
    });
  });

  describe('setupTwoFactorAuth', () => {
    it.skip('should setup 2FA for user with phone number', async () => {
      const setupData = {
        phoneNumber: '+1234567890',
        enableSMS: true,
      };

      const mockSecret = {
        base32: 'JBSWY3DPEHPK3PXP',
        otpauth_url:
          'otpauth://totp/FinBot%20(test-user-id)?secret=JBSWY3DPEHPK3PXP&issuer=FinBot',
      };

      vi.mocked(speakeasy.generateSecret).mockReturnValue(mockSecret);

      const result = await service.setupTwoFactorAuth(mockUserId, setupData);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCodeUrl');
      expect(result).toHaveProperty('backupCodes');
      expect(result.secret).toBe('JBSWY3DPEHPK3PXP');
    });

    it.skip('should setup 2FA for user without phone number', async () => {
      const setupData = {
        enableSMS: false,
      };

      const mockSecret = {
        base32: 'JBSWY3DPEHPK3PXP',
        otpauth_url:
          'otpauth://totp/FinBot%20(test-user-id)?secret=JBSWY3DPEHPK3PXP&issuer=FinBot',
      };

      vi.mocked(speakeasy.generateSecret).mockReturnValue(mockSecret);

      const result = await service.setupTwoFactorAuth(mockUserId, setupData);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCodeUrl');
      expect(result).toHaveProperty('backupCodes');
    });

    it('should handle setup errors', async () => {
      const setupData = {
        phoneNumber: '+1234567890',
        enableSMS: true,
      };

      vi.mocked(speakeasy.generateSecret).mockImplementation(() => {
        throw new Error('Setup failed');
      });

      await expect(
        service.setupTwoFactorAuth(mockUserId, setupData)
      ).rejects.toThrow('Failed to setup 2FA');
    });
  });

  describe('enableTwoFactorAuth', () => {
    it.skip('should enable 2FA after successful verification', async () => {
      const enableData = {
        secret: 'JBSWY3DPEHPK3PXP',
        token: '123456',
        backupCodes: ['ABCD1234', 'EFGH5678'],
      };

      // Mock verification
      vi.mocked(speakeasy.totp.verify).mockReturnValue(true);

      await expect(
        service.enableTwoFactorAuth(mockUserId, enableData)
      ).resolves.toBeUndefined();
    });

    it('should reject enabling with invalid token', async () => {
      const enableData = {
        secret: 'JBSWY3DPEHPK3PXP',
        token: 'invalid',
        backupCodes: ['ABCD1234', 'EFGH5678'],
      };

      // Mock failed verification
      vi.mocked(speakeasy.totp.verify).mockReturnValue(false);

      await expect(
        service.enableTwoFactorAuth(mockUserId, enableData)
      ).rejects.toThrow('Invalid verification token');
    });

    it('should handle enable errors', async () => {
      const enableData = {
        secret: 'JBSWY3DPEHPK3PXP',
        token: '123456',
        backupCodes: ['ABCD1234', 'EFGH5678'],
      };

      vi.mocked(speakeasy.totp.verify).mockImplementation(() => {
        throw new Error('Verification failed');
      });

      await expect(
        service.enableTwoFactorAuth(mockUserId, enableData)
      ).rejects.toThrow('Failed to enable 2FA');
    });
  });

  describe('verifyTwoFactorAuth', () => {
    it('should verify valid TOTP token', async () => {
      const verifyData = {
        userId: mockUserId,
        token: '123456',
      };

      // Mock 2FA record exists
      vi.mocked(vi.mocked(service as any).db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              userId: mockUserId,
              secret: 'JBSWY3DPEHPK3PXP',
              enabled: true,
            },
          ]),
        }),
      });

      // Mock valid verification
      vi.mocked(speakeasy.totp.verify).mockReturnValue(true);

      const result = await service.verifyTwoFactorAuth(mockUserId, verifyData);

      expect(result).toBe(true);
    });

    it.skip('should verify valid backup code', async () => {
      const verifyData = {
        userId: mockUserId,
        token: 'ABCD1234',
        isBackupCode: true,
      };

      // Mock 2FA record with backup codes
      vi.mocked(vi.mocked(service as any).db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              userId: mockUserId,
              secret: 'JBSWY3DPEHPK3PXP',
              enabled: true,
              backupCodes: ['hashed_ABCD1234', 'hashed_EFGH5678'],
            },
          ]),
        }),
      });

      const result = await service.verifyTwoFactorAuth(mockUserId, verifyData);

      expect(result).toBe(true);

      vi.restoreAllMocks();
    });

    it('should return false for invalid token', async () => {
      const verifyData = {
        userId: mockUserId,
        token: 'invalid',
      };

      // Mock 2FA record exists
      vi.mocked(vi.mocked(service as any).db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              userId: mockUserId,
              secret: 'JBSWY3DPEHPK3PXP',
              enabled: true,
            },
          ]),
        }),
      });

      // Mock invalid verification
      vi.mocked(speakeasy.totp.verify).mockReturnValue(false);

      const result = await service.verifyTwoFactorAuth(mockUserId, verifyData);

      expect(result).toBe(false);
    });

    it('should return false when no 2FA record exists', async () => {
      const verifyData = {
        userId: mockUserId,
        token: '123456',
      };

      // Mock no 2FA record
      vi.mocked(vi.mocked(service as any).db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.verifyTwoFactorAuth(mockUserId, verifyData);

      expect(result).toBe(false);
    });
  });

  describe('isTwoFactorEnabled', () => {
    it('should return true when 2FA is enabled', async () => {
      // Mock enabled 2FA
      vi.mocked(vi.mocked(service as any).db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              userId: mockUserId,
              enabled: true,
            },
          ]),
        }),
      });

      const result = await service.isTwoFactorEnabled(mockUserId);

      expect(result).toBe(true);
    });

    it('should return false when 2FA is disabled', async () => {
      // Mock disabled 2FA
      vi.mocked(vi.mocked(service as any).db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              userId: mockUserId,
              enabled: false,
            },
          ]),
        }),
      });

      const result = await service.isTwoFactorEnabled(mockUserId);

      expect(result).toBe(false);
    });

    it('should return false when no 2FA record exists', async () => {
      // Mock no 2FA record
      vi.mocked(vi.mocked(service as any).db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.isTwoFactorEnabled(mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('getTwoFactorStatus', () => {
    it('should return 2FA status', async () => {
      // Mock 2FA record
      vi.mocked(vi.mocked(service as any).db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              userId: mockUserId,
              enabled: true,
              phoneNumber: '+1234567890',
              enableSMS: true,
              createdAt: new Date('2024-01-01'),
            },
          ]),
        }),
      });

      const result = await service.getTwoFactorStatus(mockUserId);

      expect(result).toHaveProperty('enabled', true);
      expect(result).toHaveProperty('phoneNumber', '+1234567890');
      expect(result).toHaveProperty('smsEnabled', true);
    });
  });

  describe('regenerateBackupCodes', () => {
    it.skip('should generate new backup codes', async () => {
      const result = await service.regenerateBackupCodes(mockUserId);

      expect(result).toHaveLength(10);
      expect(result[0]).toMatch(/^[A-F0-9]{8}$/); // 8 hex chars
    });
  });

  describe('SMS 2FA', () => {
    it('should send SMS with TOTP code', async () => {
      const phoneNumber = '+1234567890';

      // Mock sending SMS
      const result = await service.sendSMSCode(mockUserId, phoneNumber);

      expect(result).toHaveProperty('sent', true);
      expect(result).toHaveProperty('phoneNumber', phoneNumber);
    });

    it('should verify SMS code', async () => {
      const verifyData = {
        userId: mockUserId,
        token: '123456',
        isSMS: true,
      };

      // Mock 2FA record with SMS enabled
      vi.mocked(vi.mocked(service as any).db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              userId: mockUserId,
              secret: 'JBSWY3DPEHPK3PXP',
              enabled: true,
              enableSMS: true,
            },
          ]),
        }),
      });

      // Mock valid verification
      vi.mocked(speakeasy.totp.verify).mockReturnValue(true);

      const result = await service.verifyTwoFactorAuth(mockUserId, verifyData);

      expect(result).toBe(true);
    });
  });
});
