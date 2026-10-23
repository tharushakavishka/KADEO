import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => {
  console.error('❌ [SECURITY FATAL] JWT_SECRET environment variable is missing in production mode!');
  return 'kadeo_production_jwt_secret_key_2026_secure';
})() : 'kadeo_development_jwt_secret_key_2026');

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: 'seller' | 'admin' | 'customer';
  shopId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

// Middleware: Authenticate JWT Bearer Token
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(403).json({ error: 'Invalid or forged authentication token.' });
  }
};

// Middleware: Optional Authentication (attaches req.user if token present, but doesn't block)
export const optionalAuthenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
      req.user = decoded;
    } catch {
      // Ignore invalid optional tokens
    }
  }
  next();
};

// Middleware: Require Seller Role (seller or admin)
export const requireSeller = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Seller or Admin privileges required.' });
  }

  next();
};

// Middleware: Require Admin Role
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }

  next();
};

// Helper: Sign a JWT for a user
export const signUserToken = (user: { id: string; email: string; role: 'seller' | 'admin' | 'customer'; shopId?: string }) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      shopId: user.shopId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
