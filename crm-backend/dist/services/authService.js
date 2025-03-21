import jwt from 'jsonwebtoken';
import prisma from '../utils/database';
import { userService } from './userService';

// Token types
interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Token options
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export const authService = {
  /**
   * Generate JWT tokens for a user
   */
  async generateTokens(userId: string, email: string, role: string): Promise<AuthTokens> {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error('REFRESH_TOKEN_SECRET is not defined');
    }

    const tokenPayload: TokenPayload = {
      userId,
      email,
      role
    };

    // Generate access token
    const accessToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      tokenPayload,
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // Calculate expiry date for database
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7); // 7 days

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt: refreshExpiry,
        userId
      }
    });

    return {
      accessToken,
      refreshToken
    };
  },

  /**
   * Verify a refresh token and generate new tokens
   */
  async refreshToken(token: string): Promise<AuthTokens | null> {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error('REFRESH_TOKEN_SECRET is not defined');
    }

    try {
      // Find token in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true }
      });

      // Check if token exists and is not expired
      if (!storedToken || storedToken.expiresAt < new Date()) {
        return null;
      }

      // Verify token signature
      const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET) as TokenPayload;

      // Delete used refresh token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id }
      });

      // Generate new tokens
      return this.generateTokens(
        payload.userId,
        payload.email,
        payload.role
      );
    } catch (error) {
      return null;
    }
  },

  /**
   * Validate user credentials and generate tokens
   */
  async login(email: string, password: string): Promise<AuthTokens | null> {
    // Find user by email
    const user = await userService.findByEmail(email);
    if (!user) return null;

    // Verify password
    const isPasswordValid = await userService.verifyPassword(password, user.password);
    if (!isPasswordValid) return null;

    // Generate and return tokens
    return this.generateTokens(
      user.id,
      user.email,
      user.role
    );
  },

  /**
   * Invalidate a refresh token
   */
  async logout(token: string): Promise<boolean> {
    try {
      // Delete refresh token from database
      await prisma.refreshToken.deleteMany({
        where: { token }
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}; 