export interface User {
  id: number;
  nome: string;
  email: string;
  data_criacao: string;
  total_itens?: number;
  itens_disponiveis?: number;
  itens_trocados?: number;
  trocas_concluidas?: number;
  propostas_pendentes?: number;
}

export type ItemCategoria =
  | 'Livros'
  | 'Eletrônicos'
  | 'Games'
  | 'Fotografia'
  | 'Instrumentos Musicais'
  | 'Esportes e Lazer'
  | 'Jogos de Tabuleiro'
  | 'Vestuário'
  | 'Outros';

export type EstadoConservacao = 'NOVO' | 'SEMINOVO' | 'BOM' | 'REGULAR';
export type ItemStatus = 'DISPONIVEL' | 'EM_NEGOCIACAO' | 'TROCADO' | 'INATIVO';

export interface Item {
  id: number;
  usuario_id: number;
  nome: string;
  descricao: string | null;
  categoria: ItemCategoria | string;
  estado_conservacao: EstadoConservacao;
  status: ItemStatus;
  imagem_url: string | null;
  data_criacao: string;
  usuario_nome?: string;
  usuario_email?: string;
}

export type TrocaStatus = 'PENDENTE' | 'ACEITA' | 'RECUSADA' | 'CANCELADA' | 'CONCLUIDA';

export interface Troca {
  id: number;
  usuario_solicitante_id: number;
  usuario_destinatario_id: number;
  item_oferecido_id: number;
  item_solicitado_id: number;
  status: TrocaStatus;
  data_proposta: string;
  data_atualizacao: string;
  solicitante_nome?: string;
  solicitante_email?: string;
  destinatario_nome?: string;
  destinatario_email?: string;
  item_oferecido_nome?: string;
  item_oferecido_categoria?: string;
  item_oferecido_imagem?: string;
  item_oferecido_estado?: string;
  item_solicitado_nome?: string;
  item_solicitado_categoria?: string;
  item_solicitado_imagem?: string;
  item_solicitado_estado?: string;
}

export interface DbInfo {
  status: string;
  driver: string;
  databaseFile: string;
  counts: {
    usuarios: number;
    itens: number;
    trocas: number;
  };
  tables: {
    usuarios: User[];
    itens: Item[];
    trocas: any[];
  };
  files: {
    schemaSql: string;
    seedSql: string;
  };
}
