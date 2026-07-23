import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Mic, Github, Archive,
  CheckCircle, AlertCircle, Loader,
  MicOff, Upload as UploadIcon
} from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { ENDPOINTS } from '../../config/api';

type Mode = 'text' | 'voice' | 'github' | 'zip';
type UploadState = 'idle' | 'saving' | 'done' | 'error';

const modes: { id: Mode; icon: React.FC<any>; label: string; description: string }[] = [
  { id: 'text', icon: FileText, label: 'Text Idea', description: 'Describe your project in plain text' },
  { id: 'voice', icon: Mic, label: 'Voice Input', description: 'Speak your project description' },
  { id: 'github', icon: Github, label: 'GitHub Repo', description: 'Paste a GitHub repository URL' },
  { id: 'zip', icon: Archive, label: 'ZIP Upload', description: 'Upload a compressed codebase' },
];

// Browser speech recognition isn't in standard TS lib types — declare minimally here
interface SpeechRecognitionResultLike {
  transcript: string;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { [index: number]: { [index: number]: SpeechRecognitionResultLike; isFinal: boolean }; length: number };
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { getIdToken } = useAuth();

  const [mode, setMode] = useState<Mode>('text');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [error, setError] = useState('');

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptPiece = result[0].transcript;
        if (result.isFinal) {
          finalTranscriptRef.current += transcriptPiece + ' ';
        } else {
          interim += transcriptPiece;
        }
      }
      setText(finalTranscriptRef.current + interim);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      finalTranscriptRef.current = text ? text + ' ' : '';
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Please give your project a title.'); return; }
    if ((mode === 'text' || mode === 'voice') && !text.trim()) {
      setError(mode === 'voice' ? 'Please record your idea first.' : 'Please describe your project.');
      return;
    }
    if (mode === 'github' && !githubUrl.trim()) { setError('Please enter a GitHub URL.'); return; }
    if (mode === 'zip' && !zipFile) { setError('Please select a ZIP file.'); return; }

    setUploadState('saving');

    try {
      const token = await getIdToken();
      const payload: Record<string, unknown> = {
        title: title.trim(),
        input_type: mode,
      };
      if (mode === 'text' || mode === 'voice') payload.idea_description = text.trim();
      if (mode === 'github') payload.github_url = githubUrl.trim();
      if (mode === 'zip') payload.zip_filename = zipFile!.name;

      const res = await fetch(ENDPOINTS.projects.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save project');

      setUploadState('done');
    } catch {
      setError('Could not save your project. Please try again.');
      setUploadState('error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.zip')) setZipFile(file);
  };

  const resetForm = () => {
    setUploadState('idle');
    setTitle(''); setZipFile(null); setText(''); setGithubUrl('');
    finalTranscriptRef.current = '';
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
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-2">Project saved!</h2>
            <p className="text-muted mb-6">
              Your project is now on your dashboard.
              {(mode === 'github' || mode === 'zip') && ' AI analysis for this project is coming soon.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/dashboard')} className="btn-primary">
                Go to Dashboard
              </button>
              <button onClick={resetForm} className="btn-secondary">
                Add another
              </button>
            </div>
          </div>
        ) : uploadState === 'saving' ? (
          <div className="card p-8 text-center">
            <Loader size={24} className="animate-spin mx-auto mb-3 text-primary-500" />
            <p className="text-muted">Saving your project...</p>
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
                <div>
                  <label className="label" htmlFor="project-title">Project title</label>
                  <input
                    id="project-title"
                    type="text"
                    className="input"
                    placeholder="e.g., VectorSearch Engine"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                {mode === 'text' && (
                  <div>
                    <label className="label">Describe your project idea</label>
                    <textarea
                      className="input resize-none"
                      rows={8}
                      placeholder="e.g., A semantic search engine for internal documentation using LangChain and pgvector..."
                      value={text}
                      onChange={e => setText(e.target.value)}
                    />
                    <p className="text-xs text-muted mt-1">{text.length} characters — more detail = better analysis</p>
                  </div>
                )}

                {mode === 'voice' && (
                  <div className="flex flex-col items-center py-8 gap-4">
                    {!voiceSupported ? (
                      <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                        <AlertCircle size={15} />
                        Voice input isn't supported in this browser. Try Chrome or Edge, or use Text Idea instead.
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={toggleRecording}
                          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                            isRecording
                              ? 'bg-red-100 dark:bg-red-950 border-2 border-red-400 animate-pulse-slow'
                              : 'bg-primary-50 dark:bg-primary-950 border-2 border-primary-300 dark:border-primary-700 hover:border-primary-500'
                          }`}
                          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                        >
                          {isRecording ? <MicOff size={28} className="text-red-500" /> : <Mic size={28} className="text-primary-600 dark:text-primary-400" />}
                        </button>
                        <p className="text-sm text-muted">
                          {isRecording ? 'Listening... click to stop' : 'Click to start speaking'}
                        </p>

                        {/* Live transcript, editable in case recognition mishears something */}
                        <div className="w-full">
                          <label className="label">Transcript (editable)</label>
                          <textarea
                            className="input resize-none"
                            rows={6}
                            placeholder="Your spoken words will appear here as you talk..."
                            value={text}
                            onChange={e => setText(e.target.value)}
                          />
                          <p className="text-xs text-muted mt-1">{text.length} characters</p>
                        </div>
                      </>
                    )}
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
                    <p className="text-xs text-muted mt-1">
                      Saves the repo link now — automatic analysis is coming soon.
                    </p>
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
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
                      File name is saved now — actual file storage & analysis coming soon.
                    </p>
                  </div>
                )}

                <button type="submit" className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
                  <UploadIcon size={16} />Save project
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}