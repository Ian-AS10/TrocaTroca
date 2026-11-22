import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { query, resetDatabase } from '../db';

export const dbRouter = Router();

/**
 * GET /api/db/info
 * Retorna status das tabelas, contagem de registros e schema
 */
dbRouter.get('/info', async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await query('SELECT id, nome, email, data_criacao FROM USUARIO');
    const itens = await query('SELECT * FROM ITEM');
    const trocas = await query('SELECT * FROM TROCA');

    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const seedPath = path.join(process.cwd(), 'database', 'seed.sql');

    const schemaSql = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf-8') : '';
    const seedSql = fs.existsSync(seedPath) ? fs.readFileSync(seedPath, 'utf-8') : '';

    res.json({
      status: 'online',
      driver: 'SQLite (sql.js / Wasm)',
      databaseFile: 'database/troca.db',
      counts: {
        usuarios: usuarios.length,
        itens: itens.length,
        trocas: trocas.length,
      },
      tables: {
        usuarios,
        itens,
        trocas,
      },
      files: {
        schemaSql,
        seedSql,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao consultar informações do banco.' });
  }
});

/**
 * POST /api/db/reset
 * Restaura o banco de dados para os dados padrão do seed.sql
 */
dbRouter.post('/reset', async (req: Request, res: Response): Promise<void> => {
  try {
    await resetDatabase();
    res.json({ message: 'Banco de dados SQLite restaurado com sucesso para o estado inicial do seed.sql.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao resetar banco de dados.' });
  }
});
