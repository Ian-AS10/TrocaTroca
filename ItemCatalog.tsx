import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Item, ItemCategoria, EstadoConservacao } from '../types';
import { api } from '../services/api';
import { 
  Search, 
  Filter, 
  Sparkles, 
  ArrowLeftRight, 
  Tag, 
  User as UserIcon, 
  Layers, 
  CheckCircle,
  Eye
} from 'lucide-react';

const CATEGORIAS: ItemCategoria[] = [
  'Livros',
  'Eletrônicos',
  'Games',
  'Fotografia',
  'Instrumentos Musicais',
  'Esportes e Lazer',
  'Jogos de Tabuleiro',
  'Vestuário',
  'Outros',
];

const ESTADOS: EstadoConservacao[] = ['NOVO', 'SEMINOVO', 'BOM', 'REGULAR'];

interface ItemCatalogProps {
  onSelectTrade: (targetItem: Item) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const ItemCatalog: React.FC<ItemCatalogProps> = ({
  onSelectTrade,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');
  const [selectedEstado, setSelectedEstado] = useState<string>('TODOS');
  const [excludeMe, setExcludeMe] = useState<boolean>(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<Item | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.items.list({
        categoria: selectedCategoria !== 'TODAS' ? selectedCategoria : undefined,
        estado: selectedEstado !== 'TODOS' ? selectedEstado : undefined,
        busca: searchTerm.trim() || undefined,
        exclude_me: excludeMe,
      });
      setItems(res.items);
    } catch (err) {
      console.error('Erro ao buscar itens:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoria, selectedEstado, searchTerm, excludeMe]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleProposeTradeClick = (item: Item) => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    onSelectTrade(item);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Banner Showcase */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-emerald-300 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Economia Circular e Trocas Acadêmicas
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Descubra objetos incríveis e proponha uma <span className="text-emerald-400">troca</span> justa.
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Sem dinheiro envolvido. Encontre livros, games, eletrônicos e instrumentos anunciados por outros estudantes e negocie item por item.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-catalog-search"
              type="text"
              placeholder="Buscar por nome do objeto ou palavra-chave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium transition-all"
            />
          </div>

          {/* Conservation State Filter */}
          <div className="w-full md:w-48">
            <select
              id="select-filter-estado"
              aria-label="Filtrar por Estado de Conservação"
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:bg-white focus:outline-hidden focus:border-emerald-600 cursor-pointer"
            >
              <option value="TODOS">Todos os Estados</option>
              {ESTADOS.map((est) => (
                <option key={est} value={est}>
                  Estado: {est}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Exclude My Own Items */}
          {user && (
            <label className="flex items-center gap-2 text-xs font-bold text-stone-600 cursor-pointer select-none px-2 shrink-0">
              <input
                id="checkbox-exclude-me"
                type="checkbox"
                checked={excludeMe}
                onChange={(e) => setExcludeMe(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
              />
              Ocultar meus itens
            </label>
          )}

        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            id="cat-pill-todas"
            type="button"
            onClick={() => setSelectedCategoria('TODAS')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategoria === 'TODAS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Todas as Categorias
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              id={`cat-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => setSelectedCategoria(cat)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategoria === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Items */}
      {loading ? (
        <div className="py-20 text-center text-stone-400">Carregando catálogo de itens...</div>
      ) : items.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border border-stone-200 text-center space-y-3 p-6">
          <Layers className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800">Nenhum item encontrado</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Não há itens correspondentes aos filtros selecionados. Tente ajustar o termo de busca ou alterar a categoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const isMyItem = user?.id === item.usuario_id;
            return (
              <div
                key={item.id}
                id={`catalog-item-${item.id}`}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Item Image with Badges */}
                  <div className="relative h-48 bg-stone-100 overflow-hidden">
                    <img
                      src={item.imagem_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'}
                      alt={item.nome}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-stone-900/80 backdrop-blur-xs text-white rounded-lg text-[11px] font-bold">
                      {item.categoria}
                    </span>

                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/90 backdrop-blur-xs text-stone-800 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      {item.estado_conservacao}
                    </span>

                    {isMyItem && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-bold shadow-xs">
                        Seu Item
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-stone-900 text-base line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {item.nome}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {item.descricao || 'Sem descrição adicional.'}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100">
                      <span className="flex items-center gap-1 font-medium truncate max-w-[150px]">
                        <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                        {item.usuario_nome}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(item.data_criacao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0">
                  {isMyItem ? (
                    <div className="w-full py-2 bg-stone-100 text-stone-500 rounded-xl text-xs font-bold text-center">
                      Cadastrado por você
                    </div>
                  ) : (
                    <button
                      id={`btn-propor-troca-${item.id}`}
                      type="button"
                      onClick={() => handleProposeTradeClick(item)}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                      Propor Troca
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
