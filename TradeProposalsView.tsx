import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Troca } from '../types';
import { api } from '../services/api';
import { 
  Inbox, 
  Send, 
  History, 
  Check, 
  X, 
  Ban, 
  ArrowLeftRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User as UserIcon,
  AlertCircle
} from 'lucide-react';

interface TradeProposalsViewProps {
  initialSubTab?: 'recebidas' | 'enviadas' | 'historico';
}

export const TradeProposalsView: React.FC<TradeProposalsViewProps> = ({
  initialSubTab = 'recebidas',
}) => {
  const { user, refreshUser } = useAuth();
  
  const [subTab, setSubTab] = useState<'recebidas' | 'enviadas' | 'historico'>(initialSubTab);
  const [recebidas, setRecebidas] = useState<Troca[]>([]);
  const [enviadas, setEnviadas] = useState<Troca[]>([]);
  const [historico, setHistorico] = useState<Troca[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [recRes, envRes, histRes] = await Promise.all([
        api.trocas.listarRecebidas(),
        api.trocas.listarEnviadas(),
        api.trocas.historico(),
      ]);
      setRecebidas(recRes.propostas);
      setEnviadas(envRes.propostas);
      setHistorico(histRes.historico);
    } catch (err: any) {
      console.error('Erro ao carregar propostas:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAceitar = async (trocaId: number) => {
    setActionLoadingId(trocaId);
    setFeedback(null);
    try {
      const res = await api.trocas.aceitar(trocaId);
      setFeedback({ type: 'success', message: res.message });
      await loadData();
      await refreshUser();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao aceitar proposta.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRecusar = async (trocaId: number) => {
    setActionLoadingId(trocaId);
    setFeedback(null);
    try {
      const res = await api.trocas.recusar(trocaId);
      setFeedback({ type: 'success', message: res.message });
      await loadData();
      await refreshUser();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao recusar proposta.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelar = async (trocaId: number) => {
    setActionLoadingId(trocaId);
    setFeedback(null);
    try {
      const res = await api.trocas.cancelar(trocaId);
      setFeedback({ type: 'success', message: res.message });
      await loadData();
      await refreshUser();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao cancelar proposta.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            Pendente
          </span>
        );
      case 'CONCLUIDA':
      case 'ACEITA':
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Concluída
          </span>
        );
      case 'RECUSADA':
        return (
          <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-xs font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" />
            Recusada
          </span>
        );
      case 'CANCELADA':
        return (
          <span className="px-2.5 py-1 bg-stone-100 text-stone-700 border border-stone-200 rounded-full text-xs font-bold flex items-center gap-1">
            <Ban className="w-3 h-3 text-stone-500" />
            Cancelada
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  const renderTrocaCard = (troca: Troca, type: 'recebida' | 'enviada' | 'historico') => {
    const isRecebida = type === 'recebida';
    const isEnviada = type === 'enviada';
    const isPendente = troca.status === 'PENDENTE';
    const isActionLoading = actionLoadingId === troca.id;

    return (
      <div
        key={troca.id}
        id={`troca-card-${troca.id}`}
        className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
      >
        {/* Card Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span className="font-bold text-stone-900">Proposta #{troca.id}</span>
            <span>•</span>
            <span>{new Date(troca.data_proposta).toLocaleString('pt-BR')}</span>
          </div>
          <div>{renderStatusBadge(troca.status)}</div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          
          {/* Item Oferecido */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
            <img
              src={troca.item_oferecido_imagem || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'}
              alt={troca.item_oferecido_nome}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-lg object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                Item Oferecido
              </span>
              <h4 className="font-bold text-sm text-stone-900 truncate mt-1">{troca.item_oferecido_nome}</h4>
              <p className="text-[11px] text-stone-500">
                Por: <strong className="text-stone-700">{troca.solicitante_nome}</strong> ({troca.item_oferecido_categoria})
              </p>
            </div>
          </div>

          {/* Item Solicitado */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
            <img
              src={troca.item_solicitado_imagem || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'}
              alt={troca.item_solicitado_nome}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-lg object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">
                Item Solicitado
              </span>
              <h4 className="font-bold text-sm text-stone-900 truncate mt-1">{troca.item_solicitado_nome}</h4>
              <p className="text-[11px] text-stone-500">
                De: <strong className="text-stone-700">{troca.destinatario_nome}</strong> ({troca.item_solicitado_categoria})
              </p>
            </div>
          </div>

        </div>

        {/* Action Buttons for Pending Proposals */}
        {isPendente && (
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            {isRecebida && (
              <>
                <button
                  id={`btn-recusar-troca-${troca.id}`}
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => handleRecusar(troca.id)}
                  className="px-4 py-2 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Recusar Proposta
                </button>
                <button
                  id={`btn-aceitar-troca-${troca.id}`}
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => handleAceitar(troca.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isActionLoading ? 'Processando Troca...' : 'Aceitar Troca'}
                </button>
              </>
            )}

            {isEnviada && (
              <button
                id={`btn-cancelar-troca-${troca.id}`}
                type="button"
                disabled={isActionLoading}
                onClick={() => handleCancelar(troca.id)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" />
                {isActionLoading ? 'Cancelando...' : 'Cancelar Minha Proposta'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const pendentesRecebidasCount = recebidas.filter((t) => t.status === 'PENDENTE').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header View */}
      <div>
        <h2 className="text-2xl font-black text-stone-900 tracking-tight">Painel de Negociações & Trocas</h2>
        <p className="text-xs text-stone-500 mt-1">
          Acompanhe suas propostas enviadas, responda às propostas recebidas e consulte o histórico de transações concluídas.
        </p>
      </div>

      {/* Global Action Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-stone-200 gap-2 sm:gap-4 overflow-x-auto text-xs sm:text-sm font-bold">
        <button
          id="subtab-recebidas"
          onClick={() => setSubTab('recebidas')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            subTab === 'recebidas'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Propostas Recebidas ({recebidas.length})
          {pendentesRecebidasCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-rose-500 text-white rounded-full font-black">
              {pendentesRecebidasCount}
            </span>
          )}
        </button>

        <button
          id="subtab-enviadas"
          onClick={() => setSubTab('enviadas')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            subTab === 'enviadas'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Send className="w-4 h-4" />
          Propostas Enviadas ({enviadas.length})
        </button>

        <button
          id="subtab-historico"
          onClick={() => setSubTab('historico')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            subTab === 'historico'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <History className="w-4 h-4" />
          Histórico Geral ({historico.length})
        </button>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="p-12 text-center text-stone-400">Carregando propostas de negociação...</div>
      ) : (
        <div className="space-y-4">
          
          {subTab === 'recebidas' && (
            recebidas.length === 0 ? (
              <div className="p-12 bg-white rounded-2xl border border-stone-200 text-center space-y-2">
                <Inbox className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="font-bold text-stone-700 text-sm">Nenhuma proposta recebida</h4>
                <p className="text-xs text-stone-500">Quando outro usuário se interessar por um dos seus itens, a proposta aparecerá aqui.</p>
              </div>
            ) : (
              recebidas.map((t) => renderTrocaCard(t, 'recebida'))
            )
          )}

          {subTab === 'enviadas' && (
            enviadas.length === 0 ? (
              <div className="p-12 bg-white rounded-2xl border border-stone-200 text-center space-y-2">
                <Send className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="font-bold text-stone-700 text-sm">Nenhuma proposta enviada</h4>
                <p className="text-xs text-stone-500">Navegue pela Vitrine de Itens para encontrar objetos e propor trocas.</p>
              </div>
            ) : (
              enviadas.map((t) => renderTrocaCard(t, 'enviada'))
            )
          )}

          {subTab === 'historico' && (
            historico.length === 0 ? (
              <div className="p-12 bg-white rounded-2xl border border-stone-200 text-center space-y-2">
                <History className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="font-bold text-stone-700 text-sm">Nenhum registro de troca</h4>
                <p className="text-xs text-stone-500">O histórico de trocas finalizadas e canceladas ficará gravado aqui.</p>
              </div>
            ) : (
              historico.map((t) => renderTrocaCard(t, 'historico'))
            )
          )}

        </div>
      )}

    </div>
  );
};
