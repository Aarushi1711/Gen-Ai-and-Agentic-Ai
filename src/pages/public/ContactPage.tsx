import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Twitter, Github, Linkedin, CheckCircle, AlertCircle, Send } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.includes('@')) errs.email = 'Valid email required.';
    if (!form.message.trim() || form.message.length < 10) errs.message = 'Message must be at least 10 characters.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus('loading');
    // TODO: POST to ENDPOINTS.contact.send
    await new Promise(r => setTimeout(r, 1200));
    setStatus('success');
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-surface-50 to-white dark:from-surface-950 dark:to-surface-900 pt-20 pb-20">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Contact</span>
          <h1 className="text-5xl font-bold text-surface-900 dark:text-surface-100 mt-4 mb-4">Get in touch</h1>
          <p className="text-xl text-surface-600 dark:text-surface-400 max-w-xl mx-auto">
            Have a question, feedback, or partnership inquiry? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white dark:bg-surface-900">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-12">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-6">Contact info</h2>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: 'Email', value: 'hello@aaroh.ai' },
                  { icon: MessageSquare, label: 'Support', value: 'support@aaroh.ai' },
                  { icon: MapPin, label: 'Location', value: 'San Francisco, CA' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted">{label}</p>
                      <p className="text-sm font-medium text-surface-700 dark:text-surface-300">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">Follow us</h3>
              <div className="flex gap-3">
                {[
                  { icon: Twitter, label: 'Twitter', href: '#' },
                  { icon: Github, label: 'GitHub', href: '#' },
                  { icon: Linkedin, label: 'LinkedIn', href: '#' },
                ].map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-surface-500 dark:text-surface-400 transition-colors"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-2">Response time</h3>
              <p className="text-sm text-muted">We typically respond within <span className="font-medium text-surface-700 dark:text-surface-300">24 hours</span> on business days. For urgent support, email support@aaroh.ai directly.</p>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            {status === 'success' ? (
              <div className="card p-10 text-center h-full flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-accent-50 dark:bg-accent-950 flex items-center justify-center">
                  <CheckCircle size={32} className="text-accent-500" />
                </div>
                <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100">Message sent!</h3>
                <p className="text-muted max-w-sm">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                <button onClick={() => { setStatus('idle'); setForm({ name: '', email: '', subject: '', message: '' }); }} className="btn-secondary mt-2">
                  Send another
                </button>
              </div>
            ) : (
              <div className="card p-8">
                <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-6">Send a message</h2>

                {status === 'error' && (
                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-5">
                    <AlertCircle size={16} />
                    Something went wrong. Please try again.
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label" htmlFor="contact-name">Name</label>
                      <input
                        id="contact-name"
                        type="text"
                        className={`input ${errors.name ? 'border-red-400' : ''}`}
                        placeholder="Your name"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="label" htmlFor="contact-email">Email</label>
                      <input
                        id="contact-email"
                        type="email"
                        className={`input ${errors.email ? 'border-red-400' : ''}`}
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="subject">Subject</label>
                    <input
                      id="subject"
                      type="text"
                      className="input"
                      placeholder="What's this about?"
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      rows={5}
                      className={`input resize-none ${errors.message ? 'border-red-400' : ''}`}
                      placeholder="Tell us how we can help..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    />
                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                  </div>

                  <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
                    {status === 'loading' ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <><Send size={16} />Send message</>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
