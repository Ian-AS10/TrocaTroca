import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, allUsers } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, senha);
        setSuccess('Login efetuado com sucesso!');
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        if (senha !== confirmacaoSenha) {
          setError('A confirmação de senha não confere com a senha digitada.');
          setSubmitting(false);
          return;
        }
        await register(nome, email, senha, confirmacaoSenha);
        setSuccess('Conta criada e autenticada com sucesso!');
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillTestUser = (testEmail: string) => {
    setMode('login');
    setEmail(testEmail);
    setSenha('senha123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div 
        id="auth-modal-container"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Modal */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-stone-900">
              {mode === 'login' ? 'Acessar Conta' : 'Criar Nova Conta'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {mode === 'login' 
                ? 'Entre para gerenciar seus itens e negociar trocas' 
                : 'Preencha os dados abaixo para ingressar no Troca & Troca'}
            </p>
          </div>
          <button
            id="btn-close-auth-modal"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-100 bg-stone-50/50 p-1.5 mx-6 mt-4 rounded-xl border">
          <button
            id="tab-login"
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Entrar
          </button>
          <button
            id="tab-register"
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Cadastrar-se
          </button>
        </div>

        {/* Alerts */}
        <div className="px-6 pt-3">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-register-nome"
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-stone-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Endereço de E-mail *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-auth-email"
                type="email"
                required
                placeholder="usuario@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Senha de Acesso *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-auth-senha"
                type="password"
                required
                minLength={6}
                placeholder="Mínimo de 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-stone-900"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Confirmar Senha *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-register-confirmacao-senha"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Repita a senha digitada"
                  value={confirmacaoSenha}
                  onChange={(e) => setConfirmacaoSenha(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-stone-900"
                />
              </div>
            </div>
          )}

          <button
            id="btn-submit-auth"
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-block animate-spin">⌛ Processando...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Entrar no Sistema' : 'Finalizar Cadastro'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Academic Test Pills */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 text-xs">
          <p className="font-bold text-stone-600 mb-2">⚡ Contas de Teste do Seed (Senha: senha123):</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleFillTestUser('joao@email.com')}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-stone-200 hover:border-emerald-300 rounded-lg font-medium transition-colors"
            >
              João (joao@email.com)
            </button>
            <button
              type="button"
              onClick={() => handleFillTestUser('maria@email.com')}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-stone-200 hover:border-emerald-300 rounded-lg font-medium transition-colors"
            >
              Maria (maria@email.com)
            </button>
            <button
              type="button"
              onClick={() => handleFillTestUser('carlos@email.com')}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-stone-200 hover:border-emerald-300 rounded-lg font-medium transition-colors"
            >
              Carlos (carlos@email.com)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
