import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Item } from '../types';
import { api } from '../services/api';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Package, 
  CheckCircle2, 
  ArrowLeftRight, 
  KeyRound, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  AlertCircle, 
  Clock,
  ShieldCheck
} from 'lucide-react';

interface ProfileViewProps {
  onOpenCreateItem: () => void;
  onEditItem: (item: Item) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenCreateItem,
  onEditItem,
}) => {
  const { user, updateProfile, refreshUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'info' | 'edit' | 'items'>('items');
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Edit form states
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoNovaSenha, setConfirmacaoNovaSenha] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadMyItems = async () => {
    if (!user) return;
    setLoadingItems(true);
    try {
      const res = await api.auth.getUserItems(user.id);
      setMyItems(res.items);
    } catch (err: any) {
      console.error('Erro ao carregar itens do usuário:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
      loadMyItems();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="p-8 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <UserIcon className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-900">Acesso Restrito</h3>
          <p className="text-sm text-stone-500 mt-1">Faça login ou crie uma conta para visualizar e gerenciar seu perfil.</p>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      await updateProfile({
        nome,
        email,
        senha_atual: senhaAtual || undefined,
        nova_senha: novaSenha || undefined,
        confirmacao_nova_senha: confirmacaoNovaSenha || undefined,
      });

      setFeedback({ type: 'success', message: 'Perfil atualizado com sucesso!' });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmacaoNovaSenha('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao atualizar dados.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: number, itemName: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o item "${itemName}"?`)) {
      return;
    }
    try {
      await api.items.delete(itemId);
      await loadMyItems();
      await refreshUser();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir item.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-stone-700 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 text-stone-950 font-black text-3xl flex items-center justify-center shadow-lg border-2 border-white/20">
              {user.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user.nome}</h1>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[11px] font-bold uppercase tracking-wider">
                  Usuário Ativo
                </span>
              </div>
              <p className="text-stone-300 text-sm flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-emerald-400" />
                {user.email}
              </p>
              <p className="text-stone-400 text-xs flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                Membro desde: {new Date(user.data_criacao).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 w-full sm:w-auto bg-stone-950/50 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
            <div className="text-center px-3 py-1">
              <span className="block text-xl font-black text-white">{user.total_itens || myItems.length}</span>
              <span className="text-[10px] uppercase font-bold text-stone-400">Itens Cadastrados</span>
            </div>
            <div className="text-center px-3 py-1 border-x border-white/10">
              <span className="block text-xl font-black text-emerald-400">{user.itens_disponiveis ?? myItems.filter(i => i.status === 'DISPONIVEL').length}</span>
              <span className="text-[10px] uppercase font-bold text-stone-400">Disponíveis</span>
            </div>
            <div className="text-center px-3 py-1">
              <span className="block text-xl font-black text-rose-400">{user.trocas_concluidas ?? 0}</span>
              <span className="text-[10px] uppercase font-bold text-stone-400">Trocas Feitas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-4">
        <button
          id="tab-profile-items"
          onClick={() => setActiveTab('items')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'items'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          Meus Itens Cadastrados ({myItems.length})
        </button>

        <button
          id="tab-profile-edit"
          onClick={() => setActiveTab('edit')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'edit'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Editar Dados & Senha
        </button>
      </div>

      {/* Content for My Items */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Seus Objetos para Negociação</h3>
              <p className="text-xs text-stone-500">Gerencie a visibilidade, estado e informações dos seus itens cadastrados.</p>
            </div>
            <button
              id="btn-add-item-profile"
              onClick={onOpenCreateItem}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Novo Item
            </button>
          </div>

          {loadingItems ? (
            <div className="p-12 text-center text-stone-400">Carregando seus itens...</div>
          ) : myItems.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-stone-200 text-center space-y-3">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <h4 className="text-base font-bold text-stone-700">Você ainda não cadastrou nenhum objeto</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Para receber propostas e realizar trocas, anuncie itens que você não usa mais!
              </p>
              <button
                onClick={onOpenCreateItem}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
              >
                <PlusCircle className="w-4 h-4" />
                Cadastrar Primeiro Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myItems.map((item) => (
                <div
                  key={item.id}
                  id={`my-item-card-${item.id}`}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 bg-stone-100 overflow-hidden">
                      <img
                        src={item.imagem_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'}
                        alt={item.nome}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-1 bg-stone-900/80 backdrop-blur-xs text-white rounded-lg text-[11px] font-bold">
                        {item.categoria}
                      </span>
                      <span
                        className={`absolute top-2 right-2 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          item.status === 'DISPONIVEL'
                            ? 'bg-emerald-500 text-white'
                            : item.status === 'TROCADO'
                            ? 'bg-rose-600 text-white'
                            : item.status === 'EM_NEGOCIACAO'
                            ? 'bg-amber-500 text-white'
                            : 'bg-stone-500 text-white'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-stone-900 text-base line-clamp-1">{item.nome}</h4>
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[10px] font-semibold uppercase">
                          {item.estado_conservacao}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-2">
                        {item.descricao || 'Sem descrição informada.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between gap-2 mt-2">
                    <button
                      id={`btn-edit-item-${item.id}`}
                      onClick={() => onEditItem(item)}
                      className="flex-1 py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      id={`btn-delete-item-${item.id}`}
                      onClick={() => handleDeleteItem(item.id, item.nome)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Excluir item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content for Edit Profile */}
      {activeTab === 'edit' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-stone-900">Atualizar Dados Cadastrais</h3>
            <p className="text-xs text-stone-500">Mantenha seu nome, e-mail e credenciais de acesso sempre atualizados.</p>
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold mb-6 flex items-start gap-2.5 ${
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

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Nome Completo *
              </label>
              <input
                id="input-edit-nome"
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Endereço de E-mail *
              </label>
              <input
                id="input-edit-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
              />
            </div>

            <div className="pt-4 border-t border-stone-100">
              <h4 className="text-sm font-bold text-stone-800 flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Alteração de Senha (Opcional)
              </h4>
              <p className="text-xs text-stone-500 mb-4">
                Deixe em branco caso não queira alterar sua senha atual.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Senha Atual
                  </label>
                  <input
                    id="input-edit-senha-atual"
                    type="password"
                    placeholder="Digite sua senha atual para confirmar a troca"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Nova Senha
                    </label>
                    <input
                      id="input-edit-nova-senha"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Confirmar Nova Senha
                    </label>
                    <input
                      id="input-edit-confirmacao-nova-senha"
                      type="password"
                      placeholder="Repita a nova senha"
                      value={confirmacaoNovaSenha}
                      onChange={(e) => setConfirmacaoNovaSenha(e.target.value)}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                id="btn-save-profile"
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
