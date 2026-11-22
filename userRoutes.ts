import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';
import { authMiddleware } from '../middleware/authMiddleware';

export const userRouter = Router();

/**
 * GET /api/users/profile
 * Obter perfil detalhado do usuário logado
 */
userRouter.get('/profile', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await UserService.getProfileWithStats(userId);
    if (!profile) {
      res.status(404).json({ error: 'Perfil não encontrado.' });
      return;
    }
    res.json({ profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao carregar perfil.' });
  }
});

/**
 * PUT /api/users/profile
 * Atualizar perfil do usuário logado (nome, email, senha)
 */
userRouter.put('/profile', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { nome, email, senha_atual, nova_senha, confirmacao_nova_senha } = req.body;

    const updatedUser = await UserService.updateProfile(userId, {
      nome,
      email,
      senha_atual,
      nova_senha,
      confirmacao_nova_senha,
    });

    res.json({
      message: 'Perfil atualizado com sucesso!',
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao atualizar perfil.' });
  }
});

/**
 * GET /api/users/:id
 * Obter dados públicos de um usuário específico
 */
userRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'ID de usuário inválido.' });
      return;
    }

    const user = await UserService.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const items = await UserService.getUserItems(userId);

    res.json({
      user,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar informações do usuário.' });
  }
});

/**
 * GET /api/users/:id/items
 * Listar itens de um determinado usuário
 */
userRouter.get('/:id/items', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'ID de usuário inválido.' });
      return;
    }

    const items = await UserService.getUserItems(userId);
    res.json({ items });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar itens do usuário.' });
  }
});

/**
 * GET /api/users
 * Lista todos os usuários (útil para testes acadêmicos e troca rápida)
 */
userRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await UserService.getAllUsers();
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
});
