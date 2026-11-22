import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { ItemCatalog } from './components/ItemCatalog';
import { ProfileView } from './components/ProfileView';
import { TradeProposalsView } from './components/TradeProposalsView';
import { LoginScreen } from './components/LoginScreen';
import { CreateItemModal } from './components/CreateItemModal';
import { TradeModal } from './components/TradeModal';
import { Item } from './types';

function MainContent() {
  const { user, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'catalog' | 'proposals' | 'history' | 'profile'>('catalog');
  
  const [createItemModalOpen, setCreateItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [targetTradeItem, setTargetTradeItem] = useState<Item | null>(null);
  const [catalogRefreshKey, setCatalogRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-stone-500">Carregando sessão...</p>
        </div>
      </div>
    );
  }

  // Dedicated Login Screen Gate before accessing the main system
  if (!user) {
    return <LoginScreen />;
  }

  const handleOpenCreateItem = () => {
    setItemToEdit(null);
    setCreateItemModalOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setItemToEdit(item);
    setCreateItemModalOpen(true);
  };

  const handleSelectTrade = (item: Item) => {
    setTargetTradeItem(item);
    setTradeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateItem={handleOpenCreateItem}
      />

      {/* Main Viewport */}
      <main className="flex-1 pb-16">
        {activeTab === 'catalog' && (
          <ItemCatalog
            key={catalogRefreshKey}
            onSelectTrade={handleSelectTrade}
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
      </main>

      {/* Modals */}
      <CreateItemModal
        isOpen={createItemModalOpen}
        onClose={() => setCreateItemModalOpen(false)}
        itemToEdit={itemToEdit}
        onSuccess={() => {
          setCatalogRefreshKey((prev) => prev + 1);
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
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold text-stone-800">
            <span className="text-emerald-700">Troca</span> & <span className="text-rose-700">Troca</span>
            <span className="font-normal text-stone-500">— Plataforma de Economia Circular e Permutas</span>
          </div>
          <p className="text-stone-400">
            © {new Date().getFullYear()} Troca & Troca. Todos os direitos reservados.
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
