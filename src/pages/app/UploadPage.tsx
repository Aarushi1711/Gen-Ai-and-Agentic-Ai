import React, { useState } from 'react';
import {
  FileText, Mic, Github, Archive,
  CheckCircle, AlertCircle, Loader, ArrowRight,
  MicOff, Upload as UploadIcon
} from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';

type Mode = 'text' | 'voice' | 'github' | 'zip';
type UploadState = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';

const modes: { id: Mode; icon: React.ComponentType<{size?: number; className?: string}>; label: string; description: string }[] = [
  { id: 'text', icon: FileText, label: 'Text Idea', description: 'Describe your project in plain text' },
  { id: 'voice', icon: Mic, label: 'Voice Input', description: 'Record a voice description' },
  { id: 'github', icon: Github, label: 'GitHub Repo', description: 'Paste a GitHub repository URL' },
  { id: 'zip', icon: Archive, label: 'ZIP Upload', description: 'Upload a compressed codebase' },
];

function ProgressStep({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm transition-colors ${done ? 'text-accent-600 dark:text-accent-400' : active ? 'text-primary-600 dark:text-primary-400' : 'text-muted'}`}>
      {done
        ? <CheckCircle size={16} className="text-accent-500" />
        : active
          ? <Loader size={16} className="animate-spin" />
          : <div className="w-4 h-4 rounded-full border-2 border-current" />
      }
      {label}
    </div>
  );
}

export default function UploadPage() {
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');

  const steps = ['Uploading project', 'Parsing codebase', 'Running AI analysis', 'Generating roadmap'];

  const simulate = async () => {
    setUploadState('uploading');
    setStep(0);
    for (let i = 0; i < steps.length; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, 900));
    }
    setUploadState('done');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'text' && !text.trim()) { setError('Please describe your project.'); return; }
    if (mode === 'github' && !githubUrl.trim()) { setError('Please enter a GitHub URL.'); return; }
    if (mode === 'zip' && !zipFile) { setError('Please select a ZIP file.'); return; }
    setError('');
    simulate();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.zip')) setZipFile(file);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="page-title">Upload Project</h1>
          <p className="text-muted mt-1">Share your project in any format — Aaroh AI handles the rest.</p>
        </div>

        {uploadState === 'done' ? (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-accent-50 dark:bg-accent-950 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-accent-500" />
            </div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-2">Analysis complete!</h2>
            <p className="text-muted mb-6">Your project has been analyzed. Here's what's ready:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {['Health Report', 'Roadmap', 'Architecture', 'AI Chat'].map(item => (
                <div key={item} className="card p-3 text-sm text-center font-medium text-surface-700 dark:text-surface-300">
                  <CheckCircle size={16} className="text-accent-500 mx-auto mb-1" />
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/health" className="btn-primary flex items-center gap-2 justify-center">
                View Health Report <ArrowRight size={16} />
              </a>
              <button onClick={() => { setUploadState('idle'); setZipFile(null); setText(''); setGithubUrl(''); }} className="btn-secondary">
                Upload another
              </button>
            </div>
          </div>
        ) : uploadState !== 'idle' ? (
          <div className="card p-8">
            <h2 className="font-semibold text-surface-900 dark:text-surface-100 mb-6">Analyzing your project...</h2>
            <div className="space-y-4 mb-8">
              {steps.map((s, i) => (
                <ProgressStep key={s} label={s} active={i === step && uploadState !== 'done'} done={i < step || uploadState === 'done'} />
              ))}
            </div>
            <div className="w-full bg-surface-100 dark:bg-surface-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Mode selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {modes.map(({ id, icon: Icon, label, description }) => (
                <button
                  key={id}
                  onClick={() => { setMode(id); setError(''); }}
                  className={`card p-4 text-left transition-all duration-150 ${
                    mode === id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/60'
                      : 'hover:border-surface-300 dark:hover:border-surface-600'
                  }`}
                >
                  <Icon size={20} className={`mb-2 ${mode === id ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'}`} />
                  <div className={`text-sm font-medium ${mode === id ? 'text-primary-700 dark:text-primary-300' : 'text-surface-700 dark:text-surface-300'}`}>{label}</div>
                  <div className="text-xs text-muted mt-0.5 hidden sm:block">{description}</div>
                </button>
              ))}
            </div>

            <div className="card p-6">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm mb-4">
                  <AlertCircle size={15} />{error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'text' && (
                  <div>
                    <label className="label">Describe your project idea</label>
                    <textarea
                      className="input resize-none"
                      rows={8}
                      placeholder="e.g., A semantic search engine for internal documentation using LangChain and pgvector. The backend is FastAPI with PostgreSQL, and the frontend is React. I want to support multi-tenant access and have OpenAI embeddings for the search..."
                      value={text}
                      onChange={e => setText(e.target.value)}
                    />
                    <p className="text-xs text-muted mt-1">{text.length} characters — more detail = better analysis</p>
                  </div>
                )}

                {mode === 'voice' && (
                  <div className="flex flex-col items-center py-8 gap-4">
                    <button
                      type="button"
                      onClick={() => setIsRecording(r => !r)}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isRecording
                          ? 'bg-red-100 dark:bg-red-950 border-2 border-red-400 animate-pulse-slow'
                          : 'bg-primary-50 dark:bg-primary-950 border-2 border-primary-300 dark:border-primary-700 hover:border-primary-500'
                      }`}
                      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    >
                      {isRecording ? <MicOff size={28} className="text-red-500" /> : <Mic size={28} className="text-primary-600 dark:text-primary-400" />}
                    </button>
                    <p className="text-sm text-muted">{isRecording ? 'Recording... click to stop' : 'Click to start recording'}</p>
                    {isRecording && <p className="text-xs text-muted">Speak clearly about your project idea, tech stack, and goals.</p>}
                  </div>
                )}

                {mode === 'github' && (
                  <div>
                    <label className="label" htmlFor="github-url">GitHub repository URL</label>
                    <input
                      id="github-url"
                      type="url"
                      className="input"
                      placeholder="https://github.com/username/repository"
                      value={githubUrl}
                      onChange={e => setGithubUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted mt-1">Public repositories only. Private repo support coming soon.</p>
                  </div>
                )}

                {mode === 'zip' && (
                  <div
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-xl p-10 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('zip-input')?.click()}
                  >
                    <input
                      id="zip-input"
                      type="file"
                      accept=".zip"
                      className="sr-only"
                      onChange={e => setZipFile(e.target.files?.[0] || null)}
                    />
                    {zipFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <Archive size={32} className="text-accent-500" />
                        <p className="font-medium text-surface-900 dark:text-surface-100">{zipFile.name}</p>
                        <p className="text-sm text-muted">{(zipFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button type="button" onClick={e => { e.stopPropagation(); setZipFile(null); }} className="text-xs text-red-500 hover:underline">Remove</button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <UploadIcon size={32} className="text-surface-400" />
                        <p className="font-medium text-surface-700 dark:text-surface-300">Drop your ZIP here</p>
                        <p className="text-sm text-muted">or click to browse</p>
                        <p className="text-xs text-muted">Max 100MB • .zip files only</p>
                      </div>
                    )}
                  </div>
                )}

                <button type="submit" className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
                  <UploadIcon size={16} />Analyze project
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
