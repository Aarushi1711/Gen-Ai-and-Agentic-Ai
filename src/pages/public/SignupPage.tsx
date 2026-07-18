import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Zap, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PublicLayout from '../../layouts/PublicLayout';

type Role = 'student' | 'developer' | 'founder' | 'researcher';

const roles: { value: Role; label: string; description: string }[] = [
  { value: 'student', label: 'Student', description: 'Learning & building projects' },
  { value: 'developer', label: 'Developer', description: 'Professional engineer' },
  { value: 'founder', label: 'Founder', description: 'Building a startup' },
  { value: 'researcher', label: 'Researcher', description: 'Academic / R&D work' },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'developer' as Role });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.includes('@')) errs.email = 'Enter a valid email.';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    const { error } = await signup(form);
    setLoading(false);
    if (error) {
      setApiError(error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg animate-slide-up">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-glow">
              <Zap size={24} className="text-white" />
            </div>
          </div>

          <div className="card p-8">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-1 text-center">Create your account</h1>
            <p className="text-muted text-center mb-8">Start mentoring your projects with AI</p>

            {apiError && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-6">
                <AlertCircle size={16} className="flex-shrink-0" />
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="label" htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="Alex Chen"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  autoComplete="name"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="label" htmlFor="signup-email">Email address</label>
                <input
                  id="signup-email"
                  type="email"
                  className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="label" htmlFor="signup-password">Password</label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`input pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    autoComplete="new-password"
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
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              {/* Role selector */}
              <div>
                <label className="label">I am a...</label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map(({ value, label, description }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, role: value }))}
                      className={`p-3 rounded-lg border text-left transition-all duration-150 ${
                        form.role === value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                          : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm font-medium ${form.role === value ? 'text-primary-700 dark:text-primary-300' : 'text-surface-700 dark:text-surface-300'}`}>
                          {label}
                        </span>
                        {form.role === value && (
                          <Check size={14} className="text-primary-600 dark:text-primary-400" />
                        )}
                      </div>
                      <span className="text-xs text-muted">{description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : 'Create account'}
              </button>
            </form>

            <p className="text-xs text-muted text-center mt-4">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
