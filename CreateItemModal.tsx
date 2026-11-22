import React, { useState, useEffect } from 'react';
import { Item, ItemCategoria, EstadoConservacao } from '../types';
import { api } from '../services/api';
import { X, Package, Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemToEdit?: Item | null;
}

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

const SAMPLE_IMAGES: { label: string; url: string }[] = [
  { label: 'Livro', url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Videogame / Console', url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&auto=format&fit=crop&q=80' },
  { label: 'Eletrônico / Gadget', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80' },
  { label: 'Instrumento Musical', url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80' },
  { label: 'Câmera Vintage', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Esportes / Bike', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80' },
];

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  itemToEdit,
}) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<ItemCategoria>('Livros');
  const [estadoConservacao, setEstadoConservacao] = useState<EstadoConservacao>('SEMINOVO');
  const [imagemUrl, setImagemUrl] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setNome(itemToEdit.nome);
      setDescricao(itemToEdit.descricao || '');
      setCategoria(itemToEdit.categoria as ItemCategoria);
      setEstadoConservacao(itemToEdit.estado_conservacao);
      setImagemUrl(itemToEdit.imagem_url || '');
    } else {
      setNome('');
      setDescricao('');
      setCategoria('Livros');
      setEstadoConservacao('SEMINOVO');
      setImagemUrl(SAMPLE_IMAGES[0].url);
    }
    setError(null);
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (itemToEdit) {
        await api.items.update(itemToEdit.id, {
          nome,
          descricao,
          categoria,
          estado_conservacao: estadoConservacao,
          imagem_url: imagemUrl,
        });
      } else {
        await api.items.create({
          nome,
          descricao,
          categoria,
          estado_conservacao: estadoConservacao,
          imagem_url: imagemUrl || undefined,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar o item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div 
        id="item-modal-container"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                {itemToEdit ? 'Editar Objeto' : 'Cadastrar Novo Objeto para Troca'}
              </h3>
              <p className="text-xs text-stone-500">
                {itemToEdit ? 'Atualize as informações do seu anúncio' : 'Disponibilize seu item na vitrine para outros membros'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-item-modal"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Título do Objeto *
            </label>
            <input
              id="input-item-nome"
              type="text"
              required
              placeholder="Ex: Livro Harry Potter e a Pedra Filosofal"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Categoria *
              </label>
              <select
                id="select-item-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as ItemCategoria)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:bg-white focus:outline-hidden focus:border-emerald-600 cursor-pointer"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Estado de Conservação *
              </label>
              <select
                id="select-item-estado"
                value={estadoConservacao}
                onChange={(e) => setEstadoConservacao(e.target.value as EstadoConservacao)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:bg-white focus:outline-hidden focus:border-emerald-600 cursor-pointer"
              >
                {ESTADOS.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Descrição Detalhada
            </label>
            <textarea
              id="input-item-descricao"
              rows={3}
              placeholder="Descreva detalhes como edição, marcas de uso, peças inclusas, etc."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              URL da Imagem
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-item-imagem"
                type="url"
                placeholder="https://..."
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
              />
            </div>
            
            {/* Quick Image Suggestions */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Exemplos de Fotos:
              </span>
              {SAMPLE_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImagemUrl(img.url)}
                  className="px-2 py-0.5 bg-stone-100 hover:bg-emerald-50 text-[10px] font-semibold text-stone-600 hover:text-emerald-800 rounded-md border border-stone-200 transition-colors"
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Preview */}
          {imagemUrl && (
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
              <img
                src={imagemUrl}
                alt="Prévia"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border border-stone-200"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="text-xs text-stone-500">
                <span className="font-bold text-stone-700 block">Prévia da Foto</span>
                <span>Imagem carregada para exibição na vitrine</span>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-stone-600 hover:text-stone-800 text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              id="btn-submit-item-form"
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : itemToEdit ? 'Atualizar Item' : 'Publicar Objeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
