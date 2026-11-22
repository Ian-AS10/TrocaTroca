import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, 
  LogOut, 
  Layers, 
  History, 
  Inbox, 
  User as UserIcon 
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'catalog' | 'proposals' | 'history' | 'profile';
  setActiveTab: (tab: 'catalog' | 'proposals' | 'history' | 'profile') => void;
  onOpenCreateItem: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateItem,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Brand Title (Single-line wordmark) */}
          <button
            id="brand-logo"
            type="button"
            onClick={() => setActiveTab('catalog')}
            className="flex items-center gap-2.5 cursor-pointer select-none group whitespace-nowrap shrink-0"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-stone-50 border border-stone-200 group-hover:border-emerald-500 transition-colors">
              <svg viewBox="0 0 100 100" className="w-5 h-5">
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
            <span className="font-black text-xl tracking-tight text-stone-900">
              <span className="text-emerald-600">Troca</span> & <span className="text-rose-600">Troca</span>
            </span>
          </button>

          {/* Zone 2: Navigation Links (Clean single-line text links) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <button
              id="nav-catalog-btn"
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`py-5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'border-emerald-600 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              Vitrine de Itens
            </button>

            <button
              id="nav-proposals-btn"
              type="button"
              onClick={() => setActiveTab('proposals')}
              className={`py-5 border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'proposals'
                  ? 'border-emerald-600 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <span>Negociações</span>
              {user?.propostas_pendentes && user.propostas_pendentes > 0 ? (
                <span className="text-xs font-bold text-rose-600 tabular-nums">
                  ({user.propostas_pendentes})
                </span>
              ) : null}
            </button>

            <button
              id="nav-history-btn"
              type="button"
              onClick={() => setActiveTab('history')}
              className={`py-5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'history'
                  ? 'border-emerald-600 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              Histórico
            </button>

            <button
              id="nav-profile-btn"
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`py-5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-emerald-600 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              Minha Conta
            </button>
          </nav>

          {/* Zone 3: Primary Action & Session Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="btn-create-item-header"
              type="button"
              onClick={onOpenCreateItem}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Anunciar Item</span>
            </button>

            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <button
                  id="btn-profile-header"
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer whitespace-nowrap"
                  title="Acessar Minha Conta"
                >
                  <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                    {user.nome.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-semibold text-xs max-w-[110px] truncate">
                    {user.nome.split(' ')[0]}
                  </span>
                </button>

                <button
                  id="btn-logout-header"
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Encerrar Sessão"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-stone-100 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`py-1.5 px-2.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'catalog' ? 'text-emerald-700 bg-emerald-50' : 'text-stone-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Vitrine</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('proposals')}
            className={`py-1.5 px-2.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'proposals' ? 'text-emerald-700 bg-emerald-50' : 'text-stone-600'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Negociações</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-1.5 px-2.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'history' ? 'text-emerald-700 bg-emerald-50' : 'text-stone-600'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-1.5 px-2.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'profile' ? 'text-emerald-700 bg-emerald-50' : 'text-stone-600'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Conta</span>
          </button>
        </div>

      </div>
    </header>
  );
};
