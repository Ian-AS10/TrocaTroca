import { query, queryOne, run, getDatabase, saveDatabase } from '../db';
import { ItemService } from './itemService';

export interface TrocaDTO {
  id: number;
  usuario_solicitante_id: number;
  usuario_destinatario_id: number;
  item_oferecido_id: number;
  item_solicitado_id: number;
  status: 'PENDENTE' | 'ACEITA' | 'RECUSADA' | 'CANCELADA' | 'CONCLUIDA';
  data_proposta: string;
  data_atualizacao: string;
  // Detalhes do solicitante
  solicitante_nome?: string;
  solicitante_email?: string;
  // Detalhes do destinatário
  destinatario_nome?: string;
  destinatario_email?: string;
  // Detalhes do item oferecido
  item_oferecido_nome?: string;
  item_oferecido_categoria?: string;
  item_oferecido_imagem?: string;
  item_oferecido_estado?: string;
  // Detalhes do item solicitado
  item_solicitado_nome?: string;
  item_solicitado_categoria?: string;
  item_solicitado_imagem?: string;
  item_solicitado_estado?: string;
}

export class TrocaService {
  /**
   * Consulta detalhada de propostas
   */
  private static baseSelectSql = `
    SELECT 
      t.id, t.usuario_solicitante_id, t.usuario_destinatario_id,
      t.item_oferecido_id, t.item_solicitado_id, t.status,
      t.data_proposta, t.data_atualizacao,
      u_sol.nome as solicitante_nome, u_sol.email as solicitante_email,
      u_dest.nome as destinatario_nome, u_dest.email as destinatario_email,
      i_of.nome as item_oferecido_nome, i_of.categoria as item_oferecido_categoria,
      i_of.imagem_url as item_oferecido_imagem, i_of.estado_conservacao as item_oferecido_estado,
      i_sol.nome as item_solicitado_nome, i_sol.categoria as item_solicitado_categoria,
      i_sol.imagem_url as item_solicitado_imagem, i_sol.estado_conservacao as item_solicitado_estado
    FROM TROCA t
    JOIN USUARIO u_sol ON t.usuario_solicitante_id = u_sol.id
    JOIN USUARIO u_dest ON t.usuario_destinatario_id = u_dest.id
    JOIN ITEM i_of ON t.item_oferecido_id = i_of.id
    JOIN ITEM i_sol ON t.item_solicitado_id = i_sol.id
  `;

  /**
   * Busca proposta por ID com todos os relacionamentos
   */
  static async findById(trocaId: number): Promise<TrocaDTO | null> {
    return await queryOne<TrocaDTO>(
      `${this.baseSelectSql} WHERE t.id = ?`,
      [trocaId]
    );
  }

  /**
   * Cria uma nova proposta de troca respeitando todas as regras de negócio
   */
  static async criarProposta(
    usuarioSolicitanteId: number,
    itemOferecidoId: number,
    itemSolicitadoId: number
  ): Promise<TrocaDTO> {
    if (itemOferecidoId === itemSolicitadoId) {
      throw new Error('Não é possível trocar um item por ele mesmo.');
    }

    const itemOferecido = await ItemService.findById(itemOferecidoId);
    if (!itemOferecido) {
      throw new Error('O item oferecido para a troca não foi encontrado.');
    }

    const itemSolicitado = await ItemService.findById(itemSolicitadoId);
    if (!itemSolicitado) {
      throw new Error('O item solicitado não foi encontrado.');
    }

    // Regra 1: O item oferecido deve pertencer ao usuário solicitante
    if (itemOferecido.usuario_id !== usuarioSolicitanteId) {
      throw new Error('Você só pode oferecer itens que pertençam à sua própria conta.');
    }

    // Regra 2: Não pode propor troca para si mesmo
    if (itemSolicitado.usuario_id === usuarioSolicitanteId) {
      throw new Error('Você não pode propor uma troca com um item que já é seu.');
    }

    // Regra 3: Ambos os itens devem estar DISPONÍVEIS
    if (itemOferecido.status !== 'DISPONIVEL') {
      throw new Error(`Seu item "${itemOferecido.nome}" não está disponível para troca (Status: ${itemOferecido.status}).`);
    }

    if (itemSolicitado.status !== 'DISPONIVEL') {
      throw new Error(`O item desejado "${itemSolicitado.nome}" não está disponível para troca.`);
    }

    // Regra 4: Verificar se já não existe uma proposta idêntica PENDENTE
    const existing = await queryOne<{ id: number }>(
      `SELECT id FROM TROCA 
       WHERE item_oferecido_id = ? AND item_solicitado_id = ? AND status = 'PENDENTE'`,
      [itemOferecidoId, itemSolicitadoId]
    );

    if (existing) {
      throw new Error('Já existe uma proposta pendente com estes mesmos itens.');
    }

    const usuarioDestinatarioId = itemSolicitado.usuario_id;

    const result = await run(
      `INSERT INTO TROCA (usuario_solicitante_id, usuario_destinatario_id, item_oferecido_id, item_solicitado_id, status, data_proposta, data_atualizacao)
       VALUES (?, ?, ?, ?, 'PENDENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [usuarioSolicitanteId, usuarioDestinatarioId, itemOferecidoId, itemSolicitadoId]
    );

    const troca = await this.findById(result.lastInsertRowid);
    if (!troca) {
      throw new Error('Erro ao registrar proposta de troca.');
    }
    return troca;
  }

  /**
   * Aceita uma proposta de troca de forma atômica
   */
  static async aceitarProposta(trocaId: number, usuarioId: number): Promise<TrocaDTO> {
    const troca = await this.findById(trocaId);
    if (!troca) {
      throw new Error('Proposta de troca não encontrada.');
    }

    // Regra: Apenas o destinatário pode aceitar
    if (troca.usuario_destinatario_id !== usuarioId) {
      throw new Error('Permissão negada. Apenas o destinatário desta proposta pode aceitá-la.');
    }

    if (troca.status !== 'PENDENTE') {
      throw new Error(`Esta proposta não pode mais ser aceita pois está com status: ${troca.status}.`);
    }

    // Validar novamente a disponibilidade dos dois itens
    const itemOferecido = await ItemService.findById(troca.item_oferecido_id);
    const itemSolicitado = await ItemService.findById(troca.item_solicitado_id);

    if (!itemOferecido || itemOferecido.status !== 'DISPONIVEL') {
      throw new Error(`O item oferecido "${itemOferecido?.nome || 'Item'}" não está mais disponível.`);
    }

    if (!itemSolicitado || itemSolicitado.status !== 'DISPONIVEL') {
      throw new Error(`O item solicitado "${itemSolicitado?.nome || 'Item'}" não está mais disponível.`);
    }

    // Execução atômica no banco de dados
    const db = await getDatabase();
    try {
      db.run('BEGIN TRANSACTION;');

      // 1. Atualiza o status da troca para CONCLUIDA
      db.run(
        "UPDATE TROCA SET status = 'CONCLUIDA', data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?",
        [trocaId]
      );

      // 2. Marca os itens envolvidos como TROCADO
      db.run(
        "UPDATE ITEM SET status = 'TROCADO' WHERE id IN (?, ?)",
        [troca.item_oferecido_id, troca.item_solicitado_id]
      );

      // 3. Cancela / Recusa automaticamente outras propostas pendentes que envolviam qualquer um desses itens
      db.run(
        `UPDATE TROCA 
         SET status = 'CANCELADA', data_atualizacao = CURRENT_TIMESTAMP 
         WHERE id != ? AND status = 'PENDENTE' 
         AND (item_oferecido_id IN (?, ?) OR item_solicitado_id IN (?, ?))`,
        [trocaId, troca.item_oferecido_id, troca.item_solicitado_id, troca.item_oferecido_id, troca.item_solicitado_id]
      );

      db.run('COMMIT;');
      saveDatabase();
    } catch (err: any) {
      db.run('ROLLBACK;');
      throw new Error(`Falha na transação de troca: ${err.message}`);
    }

    const updated = await this.findById(trocaId);
    if (!updated) {
      throw new Error('Erro ao recuperar troca aceita.');
    }
    return updated;
  }

  /**
   * Recusa uma proposta recebida
   */
  static async recusarProposta(trocaId: number, usuarioId: number): Promise<TrocaDTO> {
    const troca = await this.findById(trocaId);
    if (!troca) {
      throw new Error('Proposta não encontrada.');
    }

    if (troca.usuario_destinatario_id !== usuarioId) {
      throw new Error('Apenas o destinatário pode recusar esta proposta.');
    }

    if (troca.status !== 'PENDENTE') {
      throw new Error(`Esta proposta já foi finalizada como: ${troca.status}.`);
    }

    await run(
      "UPDATE TROCA SET status = 'RECUSADA', data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?",
      [trocaId]
    );

    const updated = await this.findById(trocaId);
    return updated!;
  }

  /**
   * Cancela uma proposta enviada pelo solicitante
   */
  static async cancelarProposta(trocaId: number, usuarioId: number): Promise<TrocaDTO> {
    const troca = await this.findById(trocaId);
    if (!troca) {
      throw new Error('Proposta não encontrada.');
    }

    if (troca.usuario_solicitante_id !== usuarioId) {
      throw new Error('Apenas o usuário que enviou a proposta pode cancelá-la.');
    }

    if (troca.status !== 'PENDENTE') {
      throw new Error(`Esta proposta não pode ser cancelada pois seu status é: ${troca.status}.`);
    }

    await run(
      "UPDATE TROCA SET status = 'CANCELADA', data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?",
      [trocaId]
    );

    const updated = await this.findById(trocaId);
    return updated!;
  }

  /**
   * Lista propostas recebidas pelo usuário logado
   */
  static async listarRecebidas(usuarioId: number): Promise<TrocaDTO[]> {
    return await query<TrocaDTO>(
      `${this.baseSelectSql} WHERE t.usuario_destinatario_id = ? ORDER BY t.data_proposta DESC`,
      [usuarioId]
    );
  }

  /**
   * Lista propostas enviadas pelo usuário logado
   */
  static async listarEnviadas(usuarioId: number): Promise<TrocaDTO[]> {
    return await query<TrocaDTO>(
      `${this.baseSelectSql} WHERE t.usuario_solicitante_id = ? ORDER BY t.data_proposta DESC`,
      [usuarioId]
    );
  }

  /**
   * Histórico de trocas concluídas ou realizadas
   */
  static async historicoUsuario(usuarioId: number): Promise<TrocaDTO[]> {
    return await query<TrocaDTO>(
      `${this.baseSelectSql} 
       WHERE (t.usuario_solicitante_id = ? OR t.usuario_destinatario_id = ?)
       ORDER BY t.data_atualizacao DESC`,
      [usuarioId, usuarioId]
    );
  }
}
