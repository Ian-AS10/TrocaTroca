# TrocaTroca — Backend (Python / Flask)

API REST em Python para o frontend estático do projeto **TrocaTroca**
(`frontend/js/api.js` já aponta para `http://localhost:5000/api`).

Stack: **Flask + SQLAlchemy (SQLite) + Flask-CORS + PyJWT**.

## Como rodar

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

# (opcional) popula o banco com o usuário de teste e os itens de exemplo
# que já existiam mockados no frontend
python seed.py

python run.py
```

O servidor sobe em `http://localhost:5000`. O banco SQLite é criado
automaticamente em `backend/trocatroca.db` na primeira execução.

Usuário de teste (criado pelo `seed.py`, igual ao que era simulado em
`login.js`): **teste@email.com / 123456**

## Autenticação

O login devolve um token JWT. O frontend guarda esse token após autenticar e
envia-o nas rotas protegidas via header:

```
Authorization: Bearer <token>
```

## Endpoints

### Usuários / autenticação
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/usuarios` | não | Cadastra usuário `{nome, email, senha}` |
| POST | `/api/login` | não | Login `{email, senha}` → `{token, usuario}` |
| GET | `/api/usuarios/me` | sim | Dados do usuário logado |

### Itens
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/itens?busca=&categoria=` | não | Lista itens disponíveis (filtros opcionais) |
| GET | `/api/itens/meus` | sim | Lista todos os itens do usuário logado |
| GET | `/api/itens/<id>` | não | Detalhe de um item |
| POST | `/api/itens` | sim | Cadastra item `{nome, categoria, estado, descricao, icone?}` |
| PUT | `/api/itens/<id>` | sim (dono) | Edita item |
| DELETE | `/api/itens/<id>` | sim (dono) | Remove item (se disponível) |

### Propostas de troca
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/propostas` | sim | Cria proposta `{item_oferecido_id, item_desejado_id}` |
| GET | `/api/propostas` | sim | Propostas **enviadas** pelo usuário |
| GET | `/api/propostas/recebidas` | sim | Propostas **recebidas** pelo usuário |
| POST | `/api/propostas/<id>/aceitar` | sim (dono do item desejado) | Aceita e conclui a troca |
| POST | `/api/propostas/<id>/recusar` | sim (dono do item desejado) | Recusa a proposta |
| POST | `/api/propostas/<id>/cancelar` | sim (proponente) | Cancela a proposta enviada |

### Histórico e dashboard
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/historico` | sim | Trocas concluídas do usuário |
| GET | `/api/dashboard` | sim | Estatísticas dos cards do dashboard |
| GET | `/api/status` | não | Healthcheck da API |

## Regras de negócio principais

- Categorias válidas: `Livros`, `Eletrônicos`, `Roupas`, `Jogos`, `Outros`.
- Estados válidos: `Novo`, `Excelente`, `Bom`, `Regular`.
- Um item só pode ser oferecido em troca pelo seu próprio dono, e não é
  possível propor troca pelo próprio item.
- Ao **aceitar** uma proposta, os dois itens envolvidos passam para o
  status `Trocado` e um registro de histórico (`Troca`) é criado
  automaticamente, encerrando também qualquer outra proposta pendente
  para esses itens só quando o usuário agir sobre elas (elas continuam
  pendentes até serem canceladas/recusadas manualmente).
- Senhas nunca são armazenadas em texto puro (hash via Werkzeug).

## Frontend

As telas de login e cadastro usam `apiRequest(...)` em
`frontend/js/api.js` para validar os dados na API. O login guarda o JWT e os
dados do usuário no `localStorage`; `apiRequest(...)` envia automaticamente
o token no header `Authorization: Bearer ...` nas chamadas seguintes.

As telas de itens e propostas ainda contêm dados ou ações simulados e precisam
ser conectadas aos endpoints correspondentes antes de serem usadas como
funcionalidades reais.
