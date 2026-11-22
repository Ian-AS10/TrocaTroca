import React, { useState, useEffect } from 'react';
import { DbInfo } from '../types';
import { api } from '../services/api';
import { 
  Database, 
  Table, 
  KeyRound, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  FileCode, 
  Layers, 
  GitBranch, 
  Server, 
  Lock,
  Sparkles
} from 'lucide-react';

export const DatabaseSchemaView: React.FC = () => {
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [resetting, setResetting] = useState<boolean>(false);
  const [activeTableTab, setActiveTableTab] = useState<'usuarios' | 'itens' | 'trocas' | 'schema' | 'seed'>('usuarios');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchDbInfo = async () => {
    setLoading(true);
    try {
      const res = await api.db.getInfo();
      setDbInfo(res);
    } catch (err: any) {
      console.error('Erro ao carregar info do banco:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbInfo();
  }, []);

  const handleReset = async () => {
    if (!window.confirm('Deseja restaurar o banco SQLite para os dados iniciais do seed.sql?')) {
      return;
    }
    setResetting(true);
    setFeedback(null);
    try {
      const res = await api.db.reset();
      setFeedback(res.message);
      await fetchDbInfo();
    } catch (err: any) {
      alert(err.message || 'Erro ao resetar banco.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Info */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-stone-700 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-500/30">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Arquitetura de Dados SQLite</h1>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Integrante 1 (feature/usuarios)
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1">
                Estrutura relacional do banco de dados, chaves estrangeiras, hash seguro de senhas e integridade referencial.
              </p>
            </div>
          </div>

          <button
            id="btn-reset-sqlite"
            type="button"
            disabled={resetting}
            onClick={handleReset}
            className="px-4 py-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            {resetting ? 'Restaurando...' : 'Restaurar Seed do Banco'}
          </button>
        </div>

        {/* Database Metric Cards */}
        {dbInfo && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-stone-950/60 rounded-xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Driver / Engine</span>
              <span className="text-sm font-black text-emerald-400">SQLite (sql.js Wasm)</span>
            </div>
            <div className="p-3 bg-stone-950/60 rounded-xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Tabela USUARIO</span>
              <span className="text-sm font-black text-white">{dbInfo.counts.usuarios} registros</span>
            </div>
            <div className="p-3 bg-stone-950/60 rounded-xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Tabela ITEM</span>
              <span className="text-sm font-black text-white">{dbInfo.counts.itens} registros</span>
            </div>
            <div className="p-3 bg-stone-950/60 rounded-xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Tabela TROCA</span>
              <span className="text-sm font-black text-white">{dbInfo.counts.trocas} propostas</span>
            </div>
          </div>
        )}
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Division of Responsibilities Accordion / Guide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded">
            Integrante 1
          </span>
          <h4 className="font-bold text-stone-900 text-xs">Banco + Usuários</h4>
          <p className="text-[11px] text-stone-600">SQLite, schema.sql, seed.sql, auth JWT, bcrypt hash, perfil.</p>
          <span className="text-[10px] font-mono text-emerald-700 block">feature/usuarios</span>
        </div>

        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-700 bg-stone-200 px-2 py-0.5 rounded">
            Integrante 2
          </span>
          <h4 className="font-bold text-stone-900 text-xs">Gestão de Itens</h4>
          <p className="text-[11px] text-stone-600">Cadastro de itens, fotos, categorias, estado e status de disponibilidade.</p>
          <span className="text-[10px] font-mono text-stone-600 block">feature/itens</span>
        </div>

        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-700 bg-stone-200 px-2 py-0.5 rounded">
            Integrante 3
          </span>
          <h4 className="font-bold text-stone-900 text-xs">Sistema de Trocas</h4>
          <p className="text-[11px] text-stone-600">Propostas atômicas, transações SQL, aceite/recusa, histórico.</p>
          <span className="text-[10px] font-mono text-stone-600 block">feature/trocas</span>
        </div>

        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-700 bg-stone-200 px-2 py-0.5 rounded">
            Integrante 4
          </span>
          <h4 className="font-bold text-stone-900 text-xs">Interface Frontend</h4>
          <p className="text-[11px] text-stone-600">UI responsiva, vitrine, modais, feedback em tempo real e UX moderna.</p>
          <span className="text-[10px] font-mono text-stone-600 block">feature/frontend</span>
        </div>
      </div>

      {/* Security & Good Practices Checklist */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Boas Práticas de Segurança e Arquitetura Implementadas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-stone-600">
          <div className="flex items-start gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 block">Hashing Bcrypt:</strong>
              Senhas nunca são salvas em texto puro; uso de salt de 10 rounds.
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 block">Queries Parametrizadas:</strong>
              Todas as consultas SQL usam bindings com <code className="bg-stone-200 px-1 rounded">?</code> contra SQL Injection.
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 block">Transações Atômicas:</strong>
              O aceite de troca usa <code className="bg-stone-200 px-1 rounded">BEGIN TRANSACTION</code> e <code className="bg-stone-200 px-1 rounded">COMMIT</code>.
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Table Inspector and SQL files */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50/70 p-2 gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTableTab('usuarios')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTableTab === 'usuarios'
                ? 'bg-white text-emerald-700 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Tabela USUARIO ({dbInfo?.counts.usuarios || 0})
          </button>

          <button
            onClick={() => setActiveTableTab('itens')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTableTab === 'itens'
                ? 'bg-white text-emerald-700 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Tabela ITEM ({dbInfo?.counts.itens || 0})
          </button>

          <button
            onClick={() => setActiveTableTab('trocas')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTableTab === 'trocas'
                ? 'bg-white text-emerald-700 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Tabela TROCA ({dbInfo?.counts.trocas || 0})
          </button>

          <button
            onClick={() => setActiveTableTab('schema')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTableTab === 'schema'
                ? 'bg-white text-emerald-700 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            database/schema.sql
          </button>

          <button
            onClick={() => setActiveTableTab('seed')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTableTab === 'seed'
                ? 'bg-white text-emerald-700 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            database/seed.sql
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="py-8 text-center text-stone-400 text-xs">Consultando banco SQLite...</div>
          ) : !dbInfo ? (
            <div className="py-8 text-center text-stone-400 text-xs">Banco não inicializado.</div>
          ) : (
            <>
              {/* USUARIO Table View */}
              {activeTableTab === 'usuarios' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-3 px-3">id (PK)</th>
                        <th className="pb-3 px-3">nome</th>
                        <th className="pb-3 px-3">email (UNIQUE)</th>
                        <th className="pb-3 px-3">senha_hash (Bcrypt)</th>
                        <th className="pb-3 px-3">data_criacao</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-mono">
                      {dbInfo.tables.usuarios.map((u: any) => (
                        <tr key={u.id} className="hover:bg-stone-50">
                          <td className="py-3 px-3 font-bold text-stone-900">{u.id}</td>
                          <td className="py-3 px-3 font-sans font-semibold text-stone-800">{u.nome}</td>
                          <td className="py-3 px-3 text-stone-600">{u.email}</td>
                          <td className="py-3 px-3 text-stone-400 text-[10px] truncate max-w-xs">
                            $2a$10$fG6mUe6KqH0dK1wY... (Hash Seguro)
                          </td>
                          <td className="py-3 px-3 text-stone-500 font-sans text-[11px]">{u.data_criacao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ITEM Table View */}
              {activeTableTab === 'itens' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-3 px-3">id (PK)</th>
                        <th className="pb-3 px-3">usuario_id (FK)</th>
                        <th className="pb-3 px-3">nome</th>
                        <th className="pb-3 px-3">categoria</th>
                        <th className="pb-3 px-3">estado</th>
                        <th className="pb-3 px-3">status</th>
                        <th className="pb-3 px-3">data_criacao</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-mono">
                      {dbInfo.tables.itens.map((item: any) => (
                        <tr key={item.id} className="hover:bg-stone-50">
                          <td className="py-3 px-3 font-bold text-stone-900">{item.id}</td>
                          <td className="py-3 px-3 text-emerald-700 font-bold">{item.usuario_id}</td>
                          <td className="py-3 px-3 font-sans font-semibold text-stone-800">{item.nome}</td>
                          <td className="py-3 px-3 font-sans text-stone-600">{item.categoria}</td>
                          <td className="py-3 px-3 font-sans text-stone-700">{item.estado_conservacao}</td>
                          <td className="py-3 px-3 font-sans">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.status === 'DISPONIVEL'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.status === 'TROCADO'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-sans text-stone-500 text-[11px]">{item.data_criacao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TROCA Table View */}
              {activeTableTab === 'trocas' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-3 px-3">id (PK)</th>
                        <th className="pb-3 px-3">solicitante_id</th>
                        <th className="pb-3 px-3">destinatario_id</th>
                        <th className="pb-3 px-3">oferecido_id</th>
                        <th className="pb-3 px-3">solicitado_id</th>
                        <th className="pb-3 px-3">status</th>
                        <th className="pb-3 px-3">data_proposta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-mono">
                      {dbInfo.tables.trocas.map((t: any) => (
                        <tr key={t.id} className="hover:bg-stone-50">
                          <td className="py-3 px-3 font-bold text-stone-900">{t.id}</td>
                          <td className="py-3 px-3 text-stone-700 font-bold">{t.usuario_solicitante_id}</td>
                          <td className="py-3 px-3 text-stone-700 font-bold">{t.usuario_destinatario_id}</td>
                          <td className="py-3 px-3 text-emerald-700 font-bold">{t.item_oferecido_id}</td>
                          <td className="py-3 px-3 text-rose-700 font-bold">{t.item_solicitado_id}</td>
                          <td className="py-3 px-3 font-sans">
                            <span className="px-2 py-0.5 bg-stone-100 rounded text-[10px] font-bold text-stone-800">
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-sans text-stone-500 text-[11px]">{t.data_proposta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* schema.sql View */}
              {activeTableTab === 'schema' && (
                <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl overflow-x-auto text-xs font-mono">
                  <pre>{dbInfo.files.schemaSql || 'Arquivo schema.sql não carregado.'}</pre>
                </div>
              )}

              {/* seed.sql View */}
              {activeTableTab === 'seed' && (
                <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl overflow-x-auto text-xs font-mono">
                  <pre>{dbInfo.files.seedSql || 'Arquivo seed.sql não carregado.'}</pre>
                </div>
              )}
            </>
          )}
        </div>

      </div>

    </div>
  );
};
