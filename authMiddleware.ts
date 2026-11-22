import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'troca-e-troca-super-secret-academic-key-2025';

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, nome: user.nome, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  let token: string | undefined;

  // 1. Tenta obter token do Header Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    // 2. Tenta obter token do cookie
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ error: 'Acesso não autorizado. Faça login para continuar.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Sessão expirada ou inválida. Faça login novamente.' });
  }
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      req.user = decoded;
    } catch {
      // Ignore invalid token on optional auth
    }
  }
  next();
}
