-- ==========================================================
-- SISTEMA "TROCA & TROCA" - SEED DE DADOS INICIAIS
-- Responsável: Integrante 1 (feature/usuarios)
-- Senha padrão dos usuários de teste: senha123
-- Hash bcrypt correspondente: $2a$10$wTzkOqYg2gQ2F9Z1F3h1u.5T1P4UqL5H0N1G9g1J7V9k3M4x2k6O2
-- ==========================================================

-- 1. Inserção de Usuários de Teste
INSERT OR IGNORE INTO USUARIO (id, nome, email, senha_hash, data_criacao) VALUES
(1, 'João Silva', 'joao@email.com', '$2a$10$fG6mUe6KqH0dK1wY2X6Pde0hYh8C5Hh5N7e5U4qG3g1K7M9x2k6O2', '2025-01-10 10:00:00'),
(2, 'Maria Santos', 'maria@email.com', '$2a$10$fG6mUe6KqH0dK1wY2X6Pde0hYh8C5Hh5N7e5U4qG3g1K7M9x2k6O2', '2025-01-11 11:30:00'),
(3, 'Carlos Oliveira', 'carlos@email.com', '$2a$10$fG6mUe6KqH0dK1wY2X6Pde0hYh8C5Hh5N7e5U4qG3g1K7M9x2k6O2', '2025-01-12 14:15:00'),
(4, 'Ana Souza', 'ana@email.com', '$2a$10$fG6mUe6KqH0dK1wY2X6Pde0hYh8C5Hh5N7e5U4qG3g1K7M9x2k6O2', '2025-01-13 09:45:00');

-- 2. Inserção de Itens de Teste (Pertencentes a diferentes usuários)
INSERT OR IGNORE INTO ITEM (id, usuario_id, nome, descricao, categoria, estado_conservacao, status, imagem_url, data_criacao) VALUES
(1, 1, 'Livro: O Senhor dos Anéis (Trilogia Completa)', 'Edição de colecionador em capa dura, folhas amareladas impecáveis sem rasuras.', 'Livros', 'SEMINOVO', 'DISPONIVEL', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80', '2025-01-15 10:00:00'),
(2, 1, 'Teclado Mecânico RGB Switch Blue', 'Teclado mecânico gamer com cabo trançado, switch azul tátil e keycaps extras.', 'Eletrônicos', 'BOM', 'DISPONIVEL', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80', '2025-01-15 11:00:00'),
(3, 2, 'Console Nintendo Switch Lite Coral', 'Console portátil em excelente estado, acompanha caixa original e carregador.', 'Games', 'SEMINOVO', 'DISPONIVEL', 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&auto=format&fit=crop&q=80', '2025-01-16 09:30:00'),
(4, 2, 'Câmera Fotográfica Analógica 35mm', 'Câmera vintage funcionando perfeitamente com lente 50mm e correia de couro.', 'Fotografia', 'BOM', 'DISPONIVEL', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80', '2025-01-16 10:00:00'),
(5, 3, 'Violão Acústico Nylon Michael', 'Violão para iniciantes/intermediários, afinado e com encordoamento novo D''Addario.', 'Instrumentos Musicais', 'BOM', 'DISPONIVEL', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80', '2025-01-17 15:00:00'),
(6, 3, 'Headset Gamer Sem Fio 7.1', 'Fone de ouvido com cancelamento de ruído passivo, almofadas novas e microfone destacável.', 'Eletrônicos', 'NOVO', 'DISPONIVEL', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', '2025-01-17 16:30:00'),
(7, 4, 'Bicicleta Urbana Aro 26 Retrô', 'Bicicleta estilo holandesa com cestinha frontal e 6 marchas Shimano.', 'Esportes e Lazer', 'BOM', 'DISPONIVEL', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80', '2025-01-18 14:00:00'),
(8, 4, 'Jogo de Tabuleiro Catan (Edição Brasileira)', 'Jogo de tabuleiro completo com todas as cartas, peças de madeira e manual.', 'Jogos de Tabuleiro', 'SEMINOVO', 'DISPONIVEL', 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&auto=format&fit=crop&q=80', '2025-01-18 14:30:00');

-- 3. Inserção de Propostas de Troca Iniciais (Testando diferentes estados)
-- Proposta 1: Maria propõe trocar seu Nintendo Switch (3) pelo Livro do João (1) - PENDENTE
INSERT OR IGNORE INTO TROCA (id, usuario_solicitante_id, usuario_destinatario_id, item_oferecido_id, item_solicitado_id, status, data_proposta, data_atualizacao) VALUES
(1, 2, 1, 3, 1, 'PENDENTE', '2025-01-19 10:00:00', '2025-01-19 10:00:00');
