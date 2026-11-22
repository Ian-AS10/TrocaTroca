import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import bcrypt from 'bcryptjs';

let dbInstance: Database | null = null;
const dbDir = path.join(process.cwd(), 'database');
const dbFilePath = path.join(dbDir, 'troca.db');

export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(dbFilePath)) {
    try {
      const fileBuffer = fs.readFileSync(dbFilePath);
      dbInstance = new SQL.Database(fileBuffer);
      // Ensure foreign keys are enabled
      dbInstance.run('PRAGMA foreign_keys = ON;');
      return dbInstance;
    } catch (err) {
      console.error('Erro ao carregar banco existente, recriando...', err);
    }
  }

  // Create new database instance
  dbInstance = new SQL.Database();
  dbInstance.run('PRAGMA foreign_keys = ON;');

  // Run schema.sql
  const schemaPath = path.join(dbDir, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    dbInstance.run(schemaSql);
  }

  // Run seed.sql
  const seedPath = path.join(dbDir, 'seed.sql');
  if (fs.existsSync(seedPath)) {
    const seedSql = fs.readFileSync(seedPath, 'utf-8');
    dbInstance.run(seedSql);

    // Update test users password hash to guarantee exact match for 'senha123'
    const defaultPasswordHash = bcrypt.hashSync('senha123', 10);
    dbInstance.run('UPDATE USUARIO SET senha_hash = ? WHERE senha_hash LIKE "$2a$%"', [defaultPasswordHash]);
  }

  saveDatabase();
  return dbInstance;
}

export function saveDatabase(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  } catch (err) {
    console.error('Erro ao persistir banco de dados em disco:', err);
  }
}

/**
 * Executa uma consulta que retorna múltiplas linhas (SELECT)
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDatabase();
  const stmt = db.prepare(sql);
  
  if (params.length > 0) {
    stmt.bind(params);
  }

  const results: T[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as T;
    results.push(row);
  }
  stmt.free();
  return results;
}

/**
 * Executa uma consulta que retorna no máximo uma linha
 */
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Executa uma instrução de modificação (INSERT, UPDATE, DELETE)
 */
export async function run(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid: number }> {
  const db = await getDatabase();
  db.run(sql, params);
  
  // Get last inserted id and total changes
  const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
  const lastInsertRowid = (lastIdResult[0]?.values[0]?.[0] as number) || 0;
  
  const changesResult = db.exec('SELECT changes() as count');
  const changes = (changesResult[0]?.values[0]?.[0] as number) || 0;

  saveDatabase();

  return {
    changes,
    lastInsertRowid,
  };
}

/**
 * Executa comandos SQL em lote (ex: reset ou migration)
 */
export async function exec(sql: string): Promise<void> {
  const db = await getDatabase();
  db.run(sql);
  saveDatabase();
}

/**
 * Reseta o banco de dados com schema e seed
 */
export async function resetDatabase(): Promise<void> {
  if (fs.existsSync(dbFilePath)) {
    fs.unlinkSync(dbFilePath);
  }
  dbInstance = null;
  await getDatabase();
}
