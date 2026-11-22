import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDatabase } from './server/db';
import { authRouter } from './server/routes/authRoutes';
import { userRouter } from './server/routes/userRoutes';
import { itemRouter } from './server/routes/itemRoutes';
import { trocaRouter } from './server/routes/trocaRoutes';
import { dbRouter } from './server/routes/dbRoutes';

const PORT = 3000;

async function startServer() {
  const app = express();

  // Middlewares essenciais
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Inicializa o banco de dados SQLite
  try {
    await getDatabase();
    console.log('📦 Banco de dados SQLite inicializado com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao inicializar SQLite:', err);
  }

  // Rotas da API REST
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/items', itemRouter);
  app.use('/api/trocas', trocaRouter);
  app.use('/api/db', dbRouter);

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      system: 'Troca & Troca',
      environment: process.env.NODE_ENV || 'development',
      time: new Date().toISOString(),
    });
  });

  // Configuração Vite / SPA
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Troca & Troca rodando em http://localhost:${PORT}`);
  });
}

startServer();
