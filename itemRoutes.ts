import { Router, Request, Response } from 'express';
import { ItemService } from '../services/itemService';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware';

export const itemRouter = Router();

/**
 * GET /api/items
 * Listar itens disponíveis com suporte a busca e filtros
 */
itemRouter.get('/', optionalAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoria, estado, status, busca, usuario_id, exclude_me } = req.query;

    const filters: any = {};
    if (categoria) filters.categoria = String(categoria);
    if (estado) filters.estado = String(estado);
    if (status) filters.status = String(status);
    if (busca) filters.busca = String(busca);
    if (usuario_id) filters.usuarioId = parseInt(String(usuario_id), 10);
    
    if (exclude_me === 'true' && req.user) {
      filters.excludeUsuarioId = req.user.id;
    }

    const items = await ItemService.listItems(filters);
    res.json({ items });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao listar itens.' });
  }
});

/**
 * GET /api/items/:id
 * Detalhes de um item específico
 */
itemRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'ID do item inválido.' });
      return;
    }

    const item = await ItemService.findById(id);
    if (!item) {
      res.status(404).json({ error: 'Item não encontrado.' });
      return;
    }

    res.json({ item });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar dados do item.' });
  }
});

/**
 * POST /api/items
 * Cadastrar novo item (Requer autenticação)
 */
itemRouter.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user!.id;
    const { nome, descricao, categoria, estado_conservacao, imagem_url } = req.body;

    const item = await ItemService.create(usuarioId, {
      nome,
      descricao,
      categoria,
      estado_conservacao,
      imagem_url,
    });

    res.status(201).json({
      message: 'Item cadastrado com sucesso!',
      item,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao cadastrar item.' });
  }
});

/**
 * PUT /api/items/:id
 * Editar item existente (Apenas proprietário)
 */
itemRouter.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const itemId = parseInt(req.params.id, 10);
    if (isNaN(itemId)) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }

    const usuarioId = req.user!.id;
    const { nome, descricao, categoria, estado_conservacao, status, imagem_url } = req.body;

    const updated = await ItemService.update(itemId, usuarioId, {
      nome,
      descricao,
      categoria,
      estado_conservacao,
      status,
      imagem_url,
    });

    res.json({
      message: 'Item atualizado com sucesso!',
      item: updated,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao atualizar item.' });
  }
});

/**
 * DELETE /api/items/:id
 * Excluir item (Apenas proprietário)
 */
itemRouter.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const itemId = parseInt(req.params.id, 10);
    if (isNaN(itemId)) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }

    const usuarioId = req.user!.id;
    await ItemService.delete(itemId, usuarioId);

    res.json({ message: 'Item excluído com sucesso.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao excluir item.' });
  }
});
