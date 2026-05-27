import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../supabaseAdmin';

export interface AuthRequest extends Request {
  userId?: string;        // ✅ changed from req.user.id → req.userId
  userEmail?: string;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.userId = user.id;                      // ✅ flat, matches all routes
  req.userEmail = user.email ?? undefined;   // ✅ null → undefined safe cast
  next();
};