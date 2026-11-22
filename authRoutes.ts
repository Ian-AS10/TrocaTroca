import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { authMiddleware } from '../middleware/authMiddleware';

export const authRouter = Router();

/**
 * POST /api/auth/register
 * Cadastro de novo usuário
 */
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, senha, confirmacao_senha } = req.body;
    const result = await AuthService.register(nome, email, senha, confirmacao_senha);

    // Define cookie seguro de autenticação
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao realizar cadastro.' });
  }
});

/**
 * POST /api/auth/login
 * Login de usuário existente
 */
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;
    const result = await AuthService.login(email, senha);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login realizado com sucesso!',
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Credenciais inválidas.' });
  }
});

/**
 * POST /api/auth/logout
 * Encerramento de sessão
 */
authRouter.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ message: 'Logout realizado com sucesso.' });
});

/**
 * GET /api/auth/me
 * Retorna dados do usuário atualmente autenticado
 */
authRouter.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado.' });
      return;
    }

    const userProfile = await UserService.getProfileWithStats(req.user.id);
    if (!userProfile) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    res.json({ user: userProfile });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao obter dados do usuário.' });
  }
});
