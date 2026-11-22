import { query, queryOne, run } from '../db';

export interface ItemDTO {
  id: number;
  usuario_id: number;
  nome: string;
  descricao: string | null;
  categoria: string;
  estado_conservacao: 'NOVO' | 'SEMINOVO' | 'BOM' | 'REGULAR';
  status: 'DISPONIVEL' | 'EM_NEGOCIACAO' | 'TROCADO' | 'INATIVO';
  imagem_url: string | null;
  data_criacao: string;
  usuario_nome?: string;
  usuario_email?: string;
}

export class ItemService {
  /**
   * Lista itens com filtros opcionais
   */
  static async listItems(filters: {
    categoria?: string;
    estado?: string;
    status?: string;
    busca?: string;
    usuarioId?: number;
    excludeUsuarioId?: number;
  }): Promise<ItemDTO[]> {
    let sql = `
      SELECT 
        i.id, i.usuario_id, i.nome, i.descricao, i.categoria, 
        i.estado_conservacao, i.status, i.imagem_url, i.data_criacao,
        u.nome as usuario_nome, u.email as usuario_email
      FROM ITEM i
      JOIN USUARIO u ON i.usuario_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.status) {
      sql += ' AND i.status = ?';
      params.push(filters.status);
    } else {
      // Por padrão na vitrine, mostrar itens disponíveis
      if (!filters.usuarioId) {
        sql += " AND i.status = 'DISPONIVEL'";
      }
    }

    if (filters.categoria && filters.categoria !== 'TODAS') {
      sql += ' AND i.categoria = ?';
      params.push(filters.categoria);
    }

    if (filters.estado) {
      sql += ' AND i.estado_conservacao = ?';
      params.push(filters.estado);
    }

    if (filters.busca && filters.busca.trim()) {
      sql += ' AND (LOWER(i.nome) LIKE ? OR LOWER(i.descricao) LIKE ?)';
      const term = `%${filters.busca.trim().toLowerCase()}%`;
      params.push(term, term);
    }

    if (filters.usuarioId) {
      sql += ' AND i.usuario_id = ?';
      params.push(filters.usuarioId);
    }

    if (filters.excludeUsuarioId) {
      sql += ' AND i.usuario_id != ?';
      params.push(filters.excludeUsuarioId);
    }

    sql += ' ORDER BY i.data_criacao DESC';

    return await query<ItemDTO>(sql, params);
  }

  /**
   * Busca item por ID com dados do proprietário
   */
  static async findById(id: number): Promise<ItemDTO | null> {
    return await queryOne<ItemDTO>(
      `SELECT 
        i.id, i.usuario_id, i.nome, i.descricao, i.categoria, 
        i.estado_conservacao, i.status, i.imagem_url, i.data_criacao,
        u.nome as usuario_nome, u.email as usuario_email
       FROM ITEM i
       JOIN USUARIO u ON i.usuario_id = u.id
       WHERE i.id = ?`,
      [id]
    );
  }

  /**
   * Cadastra um novo item
   */
  static async create(
    usuarioId: number,
    data: {
      nome: string;
      descricao?: string;
      categoria: string;
      estado_conservacao: 'NOVO' | 'SEMINOVO' | 'BOM' | 'REGULAR';
      imagem_url?: string;
    }
  ): Promise<ItemDTO> {
    if (!data.nome || !data.nome.trim()) {
      throw new Error('O nome do item é obrigatório.');
    }
    if (!data.categoria || !data.categoria.trim()) {
      throw new Error('A categoria do item é obrigatória.');
    }
    const validStates = ['NOVO', 'SEMINOVO', 'BOM', 'REGULAR'];
    if (!validStates.includes(data.estado_conservacao)) {
      throw new Error('Estado de conservação inválido. Escolha entre: NOVO, SEMINOVO, BOM ou REGULAR.');
    }

    const defaultImg = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

    const result = await run(
      `INSERT INTO ITEM (usuario_id, nome, descricao, categoria, estado_conservacao, status, imagem_url, data_criacao)
       VALUES (?, ?, ?, ?, ?, 'DISPONIVEL', ?, CURRENT_TIMESTAMP)`,
      [
        usuarioId,
        data.nome.trim(),
        data.descricao?.trim() || null,
        data.categoria.trim(),
        data.estado_conservacao,
        data.imagem_url?.trim() || defaultImg,
      ]
    );

    const item = await this.findById(result.lastInsertRowid);
    if (!item) {
      throw new Error('Erro ao buscar item criado.');
    }
    return item;
  }

  /**
   * Atualiza um item existente (verificando propriedade)
   */
  static async update(
    itemId: number,
    usuarioId: number,
    data: {
      nome?: string;
      descricao?: string;
      categoria?: string;
      estado_conservacao?: 'NOVO' | 'SEMINOVO' | 'BOM' | 'REGULAR';
      status?: 'DISPONIVEL' | 'EM_NEGOCIACAO' | 'TROCADO' | 'INATIVO';
      imagem_url?: string;
    }
  ): Promise<ItemDTO> {
    const item = await this.findById(itemId);
    if (!item) {
      throw new Error('Item não encontrado.');
    }

    if (item.usuario_id !== usuarioId) {
      throw new Error('Permissão negada. Você só pode editar itens que pertencem à sua conta.');
    }

    const validStates = ['NOVO', 'SEMINOVO', 'BOM', 'REGULAR'];
    const validStatus = ['DISPONIVEL', 'EM_NEGOCIACAO', 'TROCADO', 'INATIVO'];

    const newNome = data.nome !== undefined ? data.nome.trim() : item.nome;
    const newDescricao = data.descricao !== undefined ? data.descricao.trim() : item.descricao;
    const newCategoria = data.categoria !== undefined ? data.categoria.trim() : item.categoria;
    const newEstado = data.estado_conservacao || item.estado_conservacao;
    const newStatus = data.status || item.status;
    const newImagem = data.imagem_url !== undefined ? data.imagem_url.trim() : item.imagem_url;

    if (!newNome) {
      throw new Error('O nome do item não pode ser vazio.');
    }
    if (!validStates.includes(newEstado)) {
      throw new Error('Estado de conservação inválido.');
    }
    if (!validStatus.includes(newStatus)) {
      throw new Error('Status inválido.');
    }

    await run(
      `UPDATE ITEM 
       SET nome = ?, descricao = ?, categoria = ?, estado_conservacao = ?, status = ?, imagem_url = ?
       WHERE id = ?`,
      [newNome, newDescricao, newCategoria, newEstado, newStatus, newImagem, itemId]
    );

    const updated = await this.findById(itemId);
    if (!updated) {
      throw new Error('Erro ao recarregar item.');
    }
    return updated;
  }

  /**
   * Exclui um item (apenas se pertencer ao usuário e não estiver em troca ativa)
   */
  static async delete(itemId: number, usuarioId: number): Promise<void> {
    const item = await this.findById(itemId);
    if (!item) {
      throw new Error('Item não encontrado.');
    }

    if (item.usuario_id !== usuarioId) {
      throw new Error('Permissão negada. Você só pode excluir itens que pertencem à sua conta.');
    }

    // Verifica se item tem propostas pendentes ou foi trocado
    const activeTrocas = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM TROCA 
       WHERE (item_oferecido_id = ? OR item_solicitado_id = ?) 
       AND status IN ('PENDENTE', 'ACEITA', 'CONCLUIDA')`,
      [itemId, itemId]
    );

    if (activeTrocas && activeTrocas.count > 0) {
      throw new Error('Este item possui histórico ou propostas ativas e não pode ser excluído diretamente. Você pode marcá-lo como INATIVO.');
    }

    await run('DELETE FROM ITEM WHERE id = ?', [itemId]);
  }
}
