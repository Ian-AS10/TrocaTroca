import { Router, Request, Response } from 'express';
import { TrocaService } from '../services/trocaService';
import { authMiddleware } from '../middleware/authMiddleware';

export const trocaRouter = Router();

// Todas as rotas de troca exigem usuário autenticado
trocaRouter.use(authMiddleware);

/**
 * POST /api/trocas
 * Enviar nova proposta de troca
 */
trocaRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioSolicitanteId = req.user!.id;
    const { item_oferecido_id, item_solicitado_id } = req.body;

    if (!item_oferecido_id || !item_solicitado_id) {
      res.status(400).json({ error: 'É necessário selecionar um item oferecido e um item solicitado.' });
      return;
    }

    const troca = await TrocaService.criarProposta(
      usuarioSolicitanteId,
      parseInt(String(item_oferecido_id), 10),
      parseInt(String(item_solicitado_id), 10)
    );

    res.status(201).json({
      message: 'Proposta de troca enviada com sucesso!',
      troca,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao enviar proposta.' });
  }
});

/**
 * GET /api/trocas/recebidas
 * Listar propostas recebidas pelo usuário logado
 */
trocaRouter.get('/recebidas', async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user!.id;
    const propostas = await TrocaService.listarRecebidas(usuarioId);
    res.json({ propostas });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar propostas recebidas.' });
  }
});

/**
 * GET /api/trocas/enviadas
 * Listar propostas enviadas pelo usuário logado
 */
trocaRouter.get('/enviadas', async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user!.id;
    const propostas = await TrocaService.listarEnviadas(usuarioId);
    res.json({ propostas });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar propostas enviadas.' });
  }
});

/**
 * GET /api/trocas/historico
 * Consultar histórico de trocas do usuário logado
 */
trocaRouter.get('/historico', async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user!.id;
    const historico = await TrocaService.historicoUsuario(usuarioId);
    res.json({ historico });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar histórico de trocas.' });
  }
});

/**
 * POST /api/trocas/:id/aceitar
 * Aceitar proposta de troca recebida
 */
trocaRouter.post('/:id/aceitar', async (req: Request, res: Response): Promise<void> => {
  try {
    const trocaId = parseInt(req.params.id, 10);
    const usuarioId = req.user!.id;

    const troca = await TrocaService.aceitarProposta(trocaId, usuarioId);
    res.json({
      message: 'Proposta de troca aceita com sucesso! Os itens foram atualizados.',
      troca,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao aceitar proposta.' });
  }
});

/**
 * POST /api/trocas/:id/recusar
 * Recusar proposta de troca recebida
 */
trocaRouter.post('/:id/recusar', async (req: Request, res: Response): Promise<void> => {
  try {
    const trocaId = parseInt(req.params.id, 10);
    const usuarioId = req.user!.id;

    const troca = await TrocaService.recusarProposta(trocaId, usuarioId);
    res.json({
      message: 'Proposta de troca recusada.',
      troca,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao recusar proposta.' });
  }
});

/**
 * POST /api/trocas/:id/cancelar
 * Cancelar proposta de troca enviada
 */
trocaRouter.post('/:id/cancelar', async (req: Request, res: Response): Promise<void> => {
  try {
    const trocaId = parseInt(req.params.id, 10);
    const usuarioId = req.user!.id;

    const troca = await TrocaService.cancelarProposta(trocaId, usuarioId);
    res.json({
      message: 'Proposta de troca cancelada com sucesso.',
      troca,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao cancelar proposta.' });
  }
});
