import bcrypt from 'bcryptjs';
import { query, queryOne, run } from '../db';

export interface UserDTO {
  id: number;
  nome: string;
  email: string;
  data_criacao: string;
}

export interface UserWithStatsDTO extends UserDTO {
  total_itens: number;
  itens_disponiveis: number;
  itens_trocados: number;
  trocas_concluidas: number;
  propostas_pendentes: number;
}

// Regex padrão para validação de formato de e-mail
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UserService {
  /**
   * Valida dados de registro
   */
  static validateRegisterInput(nome?: string, email?: string, senha?: string, confirmacao_senha?: string): string | null {
    if (!nome || !nome.trim()) {
      return 'O campo Nome é obrigatório.';
    }
    if (nome.trim().length < 2) {
      return 'O Nome deve conter pelo menos 2 caracteres.';
    }
    if (!email || !email.trim()) {
      return 'O campo E-mail é obrigatório.';
    }
    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      return 'Por favor, insira um formato de e-mail válido (ex: usuario@email.com).';
    }
    if (!senha) {
      return 'O campo Senha é obrigatório.';
    }
    if (senha.length < 6) {
      return 'A senha deve conter no mínimo 6 caracteres.';
    }
    if (senha !== confirmacao_senha) {
      return 'A confirmação de senha não confere com a senha digitada.';
    }
    return null;
  }

  /**
   * Busca usuário por E-mail (inclui senha_hash para autenticação interna)
   */
  static async findByEmail(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    return await queryOne<{
      id: number;
      nome: string;
      email: string;
      senha_hash: string;
      data_criacao: string;
    }>('SELECT id, nome, email, senha_hash, data_criacao FROM USUARIO WHERE LOWER(email) = ?', [cleanEmail]);
  }

  /**
   * Busca usuário por ID (sem expor senha_hash)
   */
  static async findById(id: number): Promise<UserDTO | null> {
    return await queryOne<UserDTO>(
      'SELECT id, nome, email, data_criacao FROM USUARIO WHERE id = ?',
      [id]
    );
  }

  /**
   * Busca perfil detalhado com estatísticas do usuário
   */
  static async getProfileWithStats(userId: number): Promise<UserWithStatsDTO | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    // Total de itens e por status
    const itemStats = await query<{ status: string; total: number }>(
      'SELECT status, COUNT(*) as total FROM ITEM WHERE usuario_id = ? GROUP BY status',
      [userId]
    );

    let total_itens = 0;
    let itens_disponiveis = 0;
    let itens_trocados = 0;

    for (const stat of itemStats) {
      total_itens += stat.total;
      if (stat.status === 'DISPONIVEL') itens_disponiveis = stat.total;
      if (stat.status === 'TROCADO') itens_trocados = stat.total;
    }

    // Trocas concluídas
    const trocasConcluidasResult = await queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM TROCA 
       WHERE (usuario_solicitante_id = ? OR usuario_destinatario_id = ?) 
       AND status IN ('ACEITA', 'CONCLUIDA')`,
      [userId, userId]
    );

    // Propostas pendentes recebidas
    const pendentesResult = await queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM TROCA 
       WHERE usuario_destinatario_id = ? AND status = 'PENDENTE'`,
      [userId]
    );

    return {
      ...user,
      total_itens,
      itens_disponiveis,
      itens_trocados,
      trocas_concluidas: trocasConcluidasResult?.total || 0,
      propostas_pendentes: pendentesResult?.total || 0,
    };
  }

  /**
   * Cadastra um novo usuário no banco de dados SQLite com hash bcrypt
   */
  static async create(nome: string, email: string, senha: string): Promise<UserDTO> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanNome = nome.trim();

    // Verifica duplicidade de e-mail
    const existing = await this.findByEmail(cleanEmail);
    if (existing) {
      throw new Error('Já existe uma conta cadastrada com este e-mail.');
    }

    // Gera hash da senha usando salt de 10 rounds
    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(senha, salt);

    // Insere no banco SQLite usando query parametrizada
    const result = await run(
      'INSERT INTO USUARIO (nome, email, senha_hash, data_criacao) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [cleanNome, cleanEmail, senha_hash]
    );

    const newUser = await this.findById(result.lastInsertRowid);
    if (!newUser) {
      throw new Error('Falha ao recuperar dados do usuário recém-criado.');
    }
    return newUser;
  }

  /**
   * Atualiza dados do perfil (nome, email e opcionalmente senha)
   */
  static async updateProfile(
    userId: number,
    data: {
      nome?: string;
      email?: string;
      senha_atual?: string;
      nova_senha?: string;
      confirmacao_nova_senha?: string;
    }
  ): Promise<UserDTO> {
    const userWithHash = await queryOne<{
      id: number;
      nome: string;
      email: string;
      senha_hash: string;
      data_criacao: string;
    }>('SELECT id, nome, email, senha_hash, data_criacao FROM USUARIO WHERE id = ?', [userId]);

    if (!userWithHash) {
      throw new Error('Usuário não encontrado.');
    }

    let newNome = userWithHash.nome;
    let newEmail = userWithHash.email;
    let newSenhaHash = userWithHash.senha_hash;

    // Atualização de nome
    if (data.nome !== undefined) {
      if (!data.nome.trim() || data.nome.trim().length < 2) {
        throw new Error('O Nome deve conter pelo menos 2 caracteres.');
      }
      newNome = data.nome.trim();
    }

    // Atualização de e-mail
    if (data.email !== undefined) {
      const cleanEmail = data.email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(cleanEmail)) {
        throw new Error('Formato de e-mail inválido.');
      }
      if (cleanEmail !== userWithHash.email.toLowerCase()) {
        const existing = await queryOne('SELECT id FROM USUARIO WHERE LOWER(email) = ? AND id != ?', [cleanEmail, userId]);
        if (existing) {
          throw new Error('Este e-mail já está sendo utilizado por outro usuário.');
        }
        newEmail = cleanEmail;
      }
    }

    // Atualização de senha (se informada)
    if (data.nova_senha) {
      if (!data.senha_atual) {
        throw new Error('Para alterar a senha, informe sua senha atual.');
      }
      const match = await bcrypt.compare(data.senha_atual, userWithHash.senha_hash);
      if (!match) {
        throw new Error('A senha atual informada está incorreta.');
      }
      if (data.nova_senha.length < 6) {
        throw new Error('A nova senha deve possuir no mínimo 6 caracteres.');
      }
      if (data.nova_senha !== data.confirmacao_nova_senha) {
        throw new Error('A confirmação da nova senha não confere.');
      }

      const salt = await bcrypt.genSalt(10);
      newSenhaHash = await bcrypt.hash(data.nova_senha, salt);
    }

    await run(
      'UPDATE USUARIO SET nome = ?, email = ?, senha_hash = ? WHERE id = ?',
      [newNome, newEmail, newSenhaHash, userId]
    );

    const updated = await this.findById(userId);
    if (!updated) {
      throw new Error('Erro ao carregar usuário atualizado.');
    }
    return updated;
  }

  /**
   * Retorna os itens de um determinado usuário
   */
  static async getUserItems(userId: number) {
    return await query(
      `SELECT id, usuario_id, nome, descricao, categoria, estado_conservacao, status, imagem_url, data_criacao
       FROM ITEM 
       WHERE usuario_id = ? 
       ORDER BY data_criacao DESC`,
      [userId]
    );
  }

  /**
   * Retorna todos os usuários cadastrados (para painéis de visualização acadêmica)
   */
  static async getAllUsers(): Promise<UserDTO[]> {
    return await query<UserDTO>('SELECT id, nome, email, data_criacao FROM USUARIO ORDER BY id ASC');
  }
}
