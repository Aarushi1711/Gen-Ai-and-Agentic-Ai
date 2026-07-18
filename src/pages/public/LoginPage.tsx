import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Zap, Github, Chrome } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PublicLayout from '../../layouts/PublicLayout';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!form.email.includes('@')) return 'Enter a valid email address.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    const { error: authError } = await login(form.email, form.password);
    setLoading(false);
    if (authError) {
      setError(authError);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md animate-slide-up">
          {/* Logo mark */}
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-glow">
              <Zap size={24} className="text-white" />
            </div>
          </div>

          <div className="card p-8">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-1 text-center">Welcome back</h1>
            <p className="text-muted text-center mb-8">Sign in to your Aaroh AI account</p>

            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-6">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0" htmlFor="password">Password</label>
                  <button type="button" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign in'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
              <span className="text-xs text-muted">or continue with</span>
              <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled
                title="GitHub OAuth — connect backend"
                className="btn-secondary flex items-center justify-center gap-2 py-2.5 opacity-60 cursor-not-allowed"
              >
                <Github size={16} />GitHub
              </button>
              <button
                type="button"
                disabled
                title="Google OAuth — connect backend"
                className="btn-secondary flex items-center justify-center gap-2 py-2.5 opacity-60 cursor-not-allowed"
              >
                <Chrome size={16} />Google
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
