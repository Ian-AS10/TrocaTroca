-- ==========================================================
-- SISTEMA "TROCA & TROCA" - SCHEMA DO BANCO DE DADOS (SQLite)
-- Responsável: Integrante 1 (feature/usuarios)
-- ==========================================================

PRAGMA foreign_keys = ON;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS USUARIO (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens para Troca
CREATE TABLE IF NOT EXISTS ITEM (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT NOT NULL,
    estado_conservacao TEXT NOT NULL CHECK(estado_conservacao IN ('NOVO', 'SEMINOVO', 'BOM', 'REGULAR')),
    status TEXT NOT NULL DEFAULT 'DISPONIVEL' CHECK(status IN ('DISPONIVEL', 'EM_NEGOCIACAO', 'TROCADO', 'INATIVO')),
    imagem_url TEXT,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(id) ON DELETE CASCADE
);

-- Tabela de Propostas de Troca
CREATE TABLE IF NOT EXISTS TROCA (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_solicitante_id INTEGER NOT NULL,
    usuario_destinatario_id INTEGER NOT NULL,
    item_oferecido_id INTEGER NOT NULL,
    item_solicitado_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK(status IN ('PENDENTE', 'ACEITA', 'RECUSADA', 'CANCELADA', 'CONCLUIDA')),
    data_proposta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_solicitante_id) REFERENCES USUARIO(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_destinatario_id) REFERENCES USUARIO(id) ON DELETE CASCADE,
    FOREIGN KEY (item_oferecido_id) REFERENCES ITEM(id) ON DELETE CASCADE,
    FOREIGN KEY (item_solicitado_id) REFERENCES ITEM(id) ON DELETE CASCADE
);

-- Índices para melhoria de desempenho em buscas frequentes
CREATE INDEX IF NOT EXISTS idx_usuario_email ON USUARIO(email);
CREATE INDEX IF NOT EXISTS idx_item_usuario ON ITEM(usuario_id);
CREATE INDEX IF NOT EXISTS idx_item_status ON ITEM(status);
CREATE INDEX IF NOT EXISTS idx_item_categoria ON ITEM(categoria);
CREATE INDEX IF NOT EXISTS idx_troca_solicitante ON TROCA(usuario_solicitante_id);
CREATE INDEX IF NOT EXISTS idx_troca_destinatario ON TROCA(usuario_destinatario_id);
CREATE INDEX IF NOT EXISTS idx_troca_status ON TROCA(status);
