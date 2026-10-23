import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserModel } from '../models/User';
import { authenticateToken, requireAdmin, signUserToken, AuthenticatedRequest } from '../middleware/auth';

export const authRouter = Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// GET /api/auth/me — Return currently authenticated user from verified JWT session
authRouter.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await UserModel.findOne({ id: req.user!.userId }).select('-password').lean();
    if (!user) {
      return res.status(404).json({ error: 'User account not found or deactivated' });
    }
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/users — Admin-only user directory (Protected against public scrapers)
authRouter.get('/users', authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find().select('-password').lean();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/users/:id — Fetch user by ID (Self or Admin)
authRouter.get('/users/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Only allow users to view their own profile unless admin
    if (req.user!.role !== 'admin' && req.user!.userId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized to view this user profile' });
    }

    const user = await UserModel.findOne({ id: req.params.id }).select('-password').lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login — Email + Password Login with bcrypt verification & JWT issuance
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'This account has been suspended. Please contact support.' });
    }

    // Strict password requirement for password-based logins
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (!user.password) {
      return res.status(401).json({
        error: 'No password is configured for this account. Please sign in with Google or reset your password.',
      });
    }

    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Upgrade plaintext legacy password to bcrypt hash automatically on valid login
      isMatch = user.password === password;
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
    }

    const sanitized = user.toObject();
    delete sanitized.password;

    const token = signUserToken(sanitized);

    res.json({
      success: true,
      token,
      user: sanitized,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/google — Production-ready Google OAuth 2.0 ID Token Verification
authRouter.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken, credential } = req.body;
    const tokenToVerify = idToken || credential;

    if (!tokenToVerify) {
      return res.status(400).json({
        error: 'Google ID token is required. Client-provided raw emails are not trusted for authentication.',
      });
    }

    let verifiedEmail: string;
    let verifiedName: string;
    let verifiedAvatar: string | undefined;

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;

    try {
      // 1. Verify token using official google-auth-library
      const ticket = await googleClient.verifyIdToken({
        idToken: tokenToVerify,
        audience: clientId || undefined,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(401).json({ error: 'Empty Google token payload' });
      }

      // 2. Validate Issuer
      if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
        return res.status(401).json({ error: 'Invalid Google token issuer' });
      }

      // 3. Validate Email Verification claim
      if (!payload.email_verified) {
        return res.status(403).json({ error: 'Unverified Google email accounts are not permitted' });
      }

      // 4. Validate Expiration (handled by library, extra guard)
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return res.status(401).json({ error: 'Google authentication token has expired' });
      }

      verifiedEmail = payload.email!.toLowerCase().trim();
      verifiedName = payload.name || payload.given_name || 'Google User';
      verifiedAvatar = payload.picture;
    } catch (googleErr: any) {
      return res.status(401).json({
        error: `Google token verification failed: ${googleErr.message}. Ensure valid Google OAuth credentials.`,
      });
    }

    // 5. Account matching or safe creation
    let user = await UserModel.findOne({ email: verifiedEmail });
    if (!user) {
      user = await UserModel.create({
        id: `user-${crypto.randomUUID()}`,
        name: verifiedName.trim(),
        email: verifiedEmail,
        phone: '',
        role: 'customer',
        status: 'active',
        avatar: verifiedAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(verifiedName)}&background=10B981&color=fff`,
        createdAt: new Date().toISOString(),
      });
    } else {
      // Update avatar if not present
      if (verifiedAvatar && !user.avatar) {
        user.avatar = verifiedAvatar;
        await user.save();
      }
    }

    const sanitized = user.toObject();
    delete sanitized.password;

    const token = signUserToken(sanitized);

    res.json({
      success: true,
      token,
      user: sanitized,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register — Register Customer or Seller with Bcrypt password hashing
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role = 'customer', shopId } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required for registration' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists' });
    }

    let hashedPassword: string | undefined = undefined;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const user = await UserModel.create({
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone || '',
      password: hashedPassword,
      role: ['seller', 'admin', 'customer'].includes(role) ? role : 'customer',
      status: 'active',
      shopId: shopId || undefined,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10B981&color=fff`,
      createdAt: new Date().toISOString(),
    });

    const sanitized = user.toObject();
    delete sanitized.password;

    const token = signUserToken(sanitized);

    res.status(201).json({
      success: true,
      token,
      user: sanitized,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
