import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { ItemCatalog } from './components/ItemCatalog';
import { ProfileView } from './components/ProfileView';
import { TradeProposalsView } from './components/TradeProposalsView';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { AuthModal } from './components/AuthModal';
import { CreateItemModal } from './components/CreateItemModal';
import { TradeModal } from './components/TradeModal';
import { Item } from './types';

function MainContent() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'catalog' | 'proposals' | 'history' | 'profile' | 'database'>('catalog');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  
  const [createItemModalOpen, setCreateItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [targetTradeItem, setTargetTradeItem] = useState<Item | null>(null);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenCreateItem = () => {
    if (!user) {
      handleOpenAuth('login');
      return;
    }
    setItemToEdit(null);
    setCreateItemModalOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setItemToEdit(item);
    setCreateItemModalOpen(true);
  };

  const handleSelectTrade = (item: Item) => {
    if (!user) {
      handleOpenAuth('login');
      return;
    }
    setTargetTradeItem(item);
    setTradeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={handleOpenAuth}
        onOpenCreateItem={handleOpenCreateItem}
      />

      {/* Main Viewport */}
      <main className="flex-1 pb-16">
        {activeTab === 'catalog' && (
          <ItemCatalog
            onSelectTrade={handleSelectTrade}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === 'proposals' && (
          <TradeProposalsView initialSubTab="recebidas" />
        )}

        {activeTab === 'history' && (
          <TradeProposalsView initialSubTab="historico" />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            onOpenCreateItem={handleOpenCreateItem}
            onEditItem={handleEditItem}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseSchemaView />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <CreateItemModal
        isOpen={createItemModalOpen}
        onClose={() => setCreateItemModalOpen(false)}
        itemToEdit={itemToEdit}
        onSuccess={() => {
          // Trigger refresh if needed
        }}
      />

      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        targetItem={targetTradeItem}
        onTradeCreated={() => {
          setActiveTab('proposals');
        }}
        onOpenCreateItem={handleOpenCreateItem}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-stone-800">
            <span className="text-emerald-700">Troca</span> & <span className="text-rose-700">Troca</span>
            <span className="font-normal text-stone-600">— Projeto Acadêmico Integrado</span>
          </div>
          <p className="text-stone-600">
            SQLite • Node.js / Express • Bcrypt • JWT • React 19 • Tailwind CSS
          </p>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
