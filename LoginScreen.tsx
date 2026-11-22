import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Repeat, 
  Layers 
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, senha);
        setSuccess('Autenticado com sucesso. Carregando painel...');
      } else {
        if (senha !== confirmacaoSenha) {
          setError('A confirmação de senha não confere com a senha informada.');
          setSubmitting(false);
          return;
        }
        await register(nome, email, senha, confirmacaoSenha);
        setSuccess('Conta criada com sucesso. Acessando a plataforma...');
      }
    } catch (err: any) {
      setError(err.message || 'Não foi possível autenticar suas credenciais.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col lg:flex-row font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* Left Side: Institutional & Brand Showcase */}
      <div className="lg:w-1/2 bg-gradient-to-br from-stone-950 via-stone-900 to-emerald-950 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand Identity */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs shadow-sm">
            <svg viewBox="0 0 100 100" className="w-6 h-6">
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
          <div className="text-2xl font-black tracking-tight whitespace-nowrap">
            <span className="text-emerald-400">Troca</span>
            <span className="text-stone-400 mx-1">&</span>
            <span className="text-rose-400">Troca</span>
          </div>
        </div>

        {/* Center Hero Value Proposition */}
        <div className="relative z-10 my-12 lg:my-0 max-w-lg space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-balance">
            Negocie objetos com segurança, transparência e <span className="text-emerald-400">zero custo</span> financeiro.
          </h1>
          <p className="text-stone-300 text-base leading-relaxed">
            Conecte-se à rede de economia circular para anunciar itens que você não utiliza mais e propor permutas diretas por livros, eletrônicos, instrumentos e equipamentos.
          </p>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 text-xs text-stone-300">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-white">
                <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Catálogo Curado</span>
              </div>
              <p className="text-stone-400 leading-relaxed">
                Anuncie e filtre objetos por categoria e estado real de conservação.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-white">
                <Repeat className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Permuta Direta</span>
              </div>
              <p className="text-stone-400 leading-relaxed">
                Envie e receba propostas item por item em tempo real.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Transação Segura</span>
              </div>
              <p className="text-stone-400 leading-relaxed">
                Histórico auditável e proteção de integridade em cada acordo fechado.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="relative z-10 text-xs text-stone-400 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Troca & Troca. Todos os direitos reservados.</span>
          <span>Economia Circular & Permutas</span>
        </div>
      </div>

      {/* Right Side: Dedicated Authentication Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-8">
          
          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
            </h2>
            <p className="text-sm text-stone-500">
              {mode === 'login'
                ? 'Informe suas credenciais abaixo para entrar no sistema principal.'
                : 'Preencha seus dados cadastrais para começar a anunciar e negociar itens.'}
            </p>
          </div>

          {/* Mode Segmented Control */}
          <div className="flex p-1 bg-stone-100 rounded-xl border border-stone-200">
            <button
              id="tab-auth-login"
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                mode === 'login'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Entrar na Conta
            </button>
            <button
              id="tab-auth-register"
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                mode === 'register'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Criar Nova Conta
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label 
                  htmlFor="input-login-nome" 
                  className="block text-xs font-bold text-stone-700 mb-1.5"
                >
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-nome"
                    type="text"
                    required
                    placeholder="Digite seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-stone-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label 
                htmlFor="input-login-email" 
                className="block text-xs font-bold text-stone-700 mb-1.5"
              >
                E-mail Corporativo ou Pessoal
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-login-email"
                  type="email"
                  required
                  placeholder="seu.email@dominio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-stone-900"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="input-login-senha" 
                className="block text-xs font-bold text-stone-700 mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-login-senha"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo de 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-stone-900"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label 
                  htmlFor="input-login-confirmacao" 
                  className="block text-xs font-bold text-stone-700 mb-1.5"
                >
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-confirmacao"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Repita a senha informada"
                    value={confirmacaoSenha}
                    onChange={(e) => setConfirmacaoSenha(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-stone-900"
                  />
                </div>
              </div>
            )}

            <button
              id="btn-submit-login-screen"
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>
                {submitting
                  ? 'Autenticando...'
                  : mode === 'login'
                  ? 'Acessar Plataforma'
                  : 'Concluir Cadastro e Entrar'}
              </span>
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Toggle Mode Prompt */}
          <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
            {mode === 'login' ? (
              <p>
                Ainda não possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-4 cursor-pointer"
                >
                  Cadastre-se gratuitamente
                </button>
              </p>
            ) : (
              <p>
                Já possui cadastro ativo?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-4 cursor-pointer"
                >
                  Fazer login com minha conta
                </button>
              </p>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
