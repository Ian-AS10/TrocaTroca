import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Item } from '../types';
import { api } from '../services/api';
import { 
  X, 
  ArrowLeftRight, 
  Package, 
  AlertCircle, 
  CheckCircle2, 
  PlusCircle,
  User as UserIcon
} from 'lucide-react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: Item | null;
  onTradeCreated: () => void;
  onOpenCreateItem: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  onTradeCreated,
  onOpenCreateItem,
}) => {
  const { user } = useAuth();
  
  const [myAvailableItems, setMyAvailableItems] = useState<Item[]>([]);
  const [selectedOfferItemId, setSelectedOfferItemId] = useState<number | null>(null);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user && targetItem) {
      setLoadingItems(true);
      setError(null);
      setSuccess(null);
      setSelectedOfferItemId(null);

      api.auth.getUserItems(user.id)
        .then((res) => {
          const available = res.items.filter((i) => i.status === 'DISPONIVEL');
          setMyAvailableItems(available);
          if (available.length > 0) {
            setSelectedOfferItemId(available[0].id);
          }
        })
        .catch((err) => {
          setError(err.message || 'Erro ao buscar seus itens.');
        })
        .finally(() => {
          setLoadingItems(false);
        });
    }
  }, [isOpen, user, targetItem]);

  if (!isOpen || !targetItem || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferItemId) {
      setError('Por favor, selecione um item seu para oferecer na troca.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await api.trocas.criarProposta({
        item_oferecido_id: selectedOfferItemId,
        item_solicitado_id: targetItem.id,
      });

      setSuccess('Proposta de troca enviada com sucesso ao proprietário!');
      setTimeout(() => {
        onTradeCreated();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar proposta de troca.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedOfferedItem = myAvailableItems.find((i) => i.id === selectedOfferItemId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div 
        id="trade-modal-container"
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">Proposta de Negociação de Troca</h3>
              <p className="text-xs text-stone-500">Escolha um item da sua coleção para oferecer pelo item desejado</p>
            </div>
          </div>
          <button
            id="btn-close-trade-modal"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        <div className="px-6 pt-3">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Trade Comparison Visualizer */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Target Item (Item Solicitado) */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  Item Desejado
                </span>
                <span className="text-[10px] text-stone-500 flex items-center gap-1 font-medium">
                  <UserIcon className="w-3 h-3" />
                  {targetItem.usuario_nome}
                </span>
              </div>

              <div className="h-28 rounded-xl overflow-hidden bg-stone-200">
                <img
                  src={targetItem.imagem_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'}
                  alt={targetItem.nome}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{targetItem.nome}</h4>
                <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{targetItem.descricao || 'Sem descrição'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-stone-200 text-stone-700 rounded text-[10px] font-bold">
                    {targetItem.categoria}
                  </span>
                  <span className="px-2 py-0.5 bg-white text-stone-700 border border-stone-200 rounded text-[10px] font-bold">
                    {targetItem.estado_conservacao}
                  </span>
                </div>
              </div>
            </div>

            {/* Offered Item (Item Oferecido) */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                  Seu Item Oferecido
                </span>
                <span className="text-[10px] text-emerald-800 font-bold">
                  {user.nome.split(' ')[0]} (Você)
                </span>
              </div>

              {selectedOfferedItem ? (
                <>
                  <div className="h-28 rounded-xl overflow-hidden bg-stone-200">
                    <img
                      src={selectedOfferedItem.imagem_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'}
                      alt={selectedOfferedItem.nome}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{selectedOfferedItem.nome}</h4>
                    <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{selectedOfferedItem.descricao || 'Sem descrição'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                        {selectedOfferedItem.categoria}
                      </span>
                      <span className="px-2 py-0.5 bg-white text-stone-700 border border-emerald-200 rounded text-[10px] font-bold">
                        {selectedOfferedItem.estado_conservacao}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-stone-300 rounded-xl">
                  <Package className="w-8 h-8 text-stone-400 mb-2" />
                  <p className="text-xs text-stone-600 font-medium">Nenhum item selecionado</p>
                </div>
              )}
            </div>

          </div>

          {/* Select Offered Item from User Collection */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Selecione o item que você deseja oferecer em troca:
            </label>

            {loadingItems ? (
              <div className="p-4 text-center text-xs text-stone-400">Carregando seus itens...</div>
            ) : myAvailableItems.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-2">
                <p className="font-bold">Você não possui itens disponíveis cadastrados no momento.</p>
                <p>Para propor uma troca, cadastre um objeto que esteja em seu poder primeiro.</p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCreateItem();
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 text-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Cadastrar um Item Agora
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {myAvailableItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedOfferItemId(item.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      selectedOfferItemId === item.id
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <img
                      src={item.imagem_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'}
                      alt={item.nome}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs text-stone-900 truncate">{item.nome}</h5>
                      <span className="text-[10px] text-stone-500 block">{item.categoria} • {item.estado_conservacao}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-stone-600 hover:text-stone-800 text-xs font-bold"
          >
            Cancelar
          </button>
          
          <button
            id="btn-confirm-trade-proposal"
            type="button"
            onClick={handleSubmit}
            disabled={submitting || myAvailableItems.length === 0 || !selectedOfferItemId}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4" />
            {submitting ? 'Enviando Proposta...' : 'Enviar Proposta de Troca'}
          </button>
        </div>

      </div>
    </div>
  );
};
