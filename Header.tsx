import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeftRight, 
  PlusCircle, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  Database, 
  Layers, 
  History, 
  Inbox,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'catalog' | 'proposals' | 'history' | 'profile' | 'database';
  setActiveTab: (tab: 'catalog' | 'proposals' | 'history' | 'profile' | 'database') => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenCreateItem: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenCreateItem,
}) => {
  const { user, logout, allUsers, quickSwitchUser } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div 
            id="brand-logo"
            onClick={() => setActiveTab('catalog')} 
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-rose-50 border border-stone-200 group-hover:border-emerald-500 transition-colors shadow-xs">
              {/* Circular Arrows Logo representation */}
              <div className="relative w-6 h-6">
                <svg viewBox="0 0 100 100" className="w-full h-full transform group-hover:rotate-180 transition-transform duration-500">
                  <path 
                    d="M 25 50 A 25 25 0 0 1 75 35 L 75 20 L 95 40 L 75 60 L 75 45 A 15 15 0 0 0 35 50 Z" 
                    fill="#10b981" 
                  />
                  <path 
                    d="M 75 50 A 25 25 0 0 1 25 65 L 25 80 L 5 60 L 25 40 L 25 55 A 15 15 0 0 0 65 50 Z" 
                    fill="#ef4444" 
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 font-black text-xl tracking-tight">
                <span className="text-emerald-600">Troca</span>
                <span className="text-stone-700">&</span>
                <span className="text-rose-600">Troca</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-600">Plataforma Acadêmica</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-catalog-btn"
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'catalog'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              Vitrine de Itens
            </button>

            {user && (
              <>
                <button
                  id="nav-proposals-btn"
                  onClick={() => setActiveTab('proposals')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 relative ${
                    activeTab === 'proposals'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  Propostas
                  {user.propostas_pendentes && user.propostas_pendentes > 0 ? (
                    <span className="px-1.5 py-0.5 text-[11px] font-black bg-rose-500 text-white rounded-full leading-none animate-pulse">
                      {user.propostas_pendentes}
                    </span>
                  ) : null}
                </button>

                <button
                  id="nav-history-btn"
                  onClick={() => setActiveTab('history')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'history'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Histórico
                </button>
              </>
            )}

            <button
              id="nav-database-btn"
              onClick={() => setActiveTab('database')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'database'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/70'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-700" />
              SQLite & Integrante 1
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            
            {/* Quick Switch User Selector (Academic helper) */}
            {allUsers.length > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
                <span className="text-[11px] font-bold text-stone-500 px-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Trocar Usuário:
                </span>
                <select
                  id="quick-user-select"
                  aria-label="Trocar Usuário de Teste"
                  value={user?.email || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      quickSwitchUser(e.target.value);
                    }
                  }}
                  className="bg-white border border-stone-200 rounded-lg px-2 py-1 font-medium text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-xs cursor-pointer"
                >
                  {!user && <option value="">Selecionar Usuário de Teste</option>}
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.email}>
                      {u.nome} ({u.email.split('@')[0]})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  id="btn-create-item-header"
                  onClick={onOpenCreateItem}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center gap-2 shadow-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Anunciar Item</span>
                </button>

                <button
                  id="btn-profile-header"
                  onClick={() => setActiveTab('profile')}
                  className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition-all flex items-center gap-2 ${
                    activeTab === 'profile'
                      ? 'bg-stone-900 border-stone-900 text-white'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                  title="Meu Perfil"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {user.nome.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-medium text-xs max-w-[100px] truncate">
                    {user.nome.split(' ')[0]}
                  </span>
                </button>

                <button
                  id="btn-logout-header"
                  onClick={logout}
                  className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sair (Logout)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-open-login"
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 rounded-xl text-stone-700 hover:bg-stone-100 font-semibold text-sm transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </button>
                <button
                  id="btn-open-register"
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-xs transition-colors"
                >
                  Cadastrar-se
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-stone-100 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-1 px-2 rounded-lg flex items-center gap-1 ${
              activeTab === 'catalog' ? 'text-emerald-700 bg-emerald-50' : 'text-stone-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Vitrine
          </button>
          {user && (
            <>
              <button
                onClick={() => setActiveTab('proposals')}
                className={`py-1 px-2 rounded-lg flex items-center gap-1 ${
                  activeTab === 'proposals' ? 'text-emerald-700 bg-emerald-50' : 'text-stone-600'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                Propostas
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-1 px-2 rounded-lg flex items-center gap-1 ${
                  activeTab === 'history' ? 'text-emerald-700 bg-emerald-50' : 'text-stone-600'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Histórico
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab('database')}
            className={`py-1 px-2 rounded-lg flex items-center gap-1 ${
              activeTab === 'database' ? 'text-emerald-700 bg-emerald-50' : 'text-stone-600'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            SQLite
          </button>
        </div>

      </div>
    </header>
  );
};
