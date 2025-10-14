// @ts-nocheck - Temporary fix for TypeScript errors
import jwt from 'jsonwebtoken';
import { logger } from './utils/logger';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export class JWTAuthService {
    // Generate JWT token
    static generateToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        };
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
    // Verify JWT token
    static verifyToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return decoded;
        }
        catch (error) {
            logger.error('JWT verification error:', error);
            return null;
        }
    }
    // Extract token from Authorization header
    static extractTokenFromHeader(authHeader) {
        if (!authHeader?.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    // Generate refresh token (2 days expiry for security)
    static generateRefreshToken(userId) {
        return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '2d' });
    }
    // Verify refresh token
    static verifyRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return decoded;
        }
        catch (error) {
            logger.error('Refresh token verification error:', error);
            return null;
        }
    }
}
// Token blacklist for logout functionality
class TokenBlacklist {
    static blacklistedTokens = new Set();
    static addToBlacklist(token) {
        this.blacklistedTokens.add(token);
    }
    static isBlacklisted(token) {
        return this.blacklistedTokens.has(token);
    }
    static removeFromBlacklist(token) {
        this.blacklistedTokens.delete(token);
    }
    // Clean up expired tokens periodically (in production, use Redis or database)
    static cleanupExpiredTokens() {
        // This is a simple implementation - in production, you'd want to
        // decode tokens and check their expiry dates
        if (this.blacklistedTokens.size > 1000) {
            this.blacklistedTokens.clear();
        }
    }
}
export { TokenBlacklist };
