import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, RefreshCw, ChevronDown } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { mockChatMessages, mockProjects } from '../../data/mockData';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

const suggestedPrompts = [
  'What are the biggest risks in my architecture?',
  'Generate a 3-month roadmap for this project.',
  'How can I improve my test coverage?',
  'Explain the data flow in my system.',
  'What security vulnerabilities should I fix first?',
  'How do I scale this to 10x users?',
];

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center flex-shrink-0">
        <Zap size={14} className="text-white" />
      </div>
      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 150, 300].map(delay => (
            <span
              key={delay}
              className="w-2 h-2 rounded-full bg-surface-400 dark:bg-surface-500 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  const lines = msg.content.split('\n');

  const renderContent = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    );
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center flex-shrink-0 mt-1">
          <Zap size={14} className="text-white" />
        </div>
      )}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-primary-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 rounded-tl-sm'
          }`}
        >
          {lines.map((line, i) => (
            <p key={i} className={line === '' ? 'h-2' : ''}>
              {renderContent(line)}
            </p>
          ))}
        </div>
        <span className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(mockChatMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeProject, setActiveProject] = useState(mockProjects[0]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // TODO: POST to ENDPOINTS.ai.chat with project context
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));

    const aiMsg: Message = {
      id: `msg_${Date.now()}_ai`,
      role: 'assistant',
      content: `Great question about **${activeProject.name}**. Based on my analysis of your ${activeProject.techStack.join(', ')} stack, here's what I recommend:\n\nI've reviewed your project structure and can see several opportunities for improvement. Your current architecture shows solid fundamentals, but there are specific areas we should address to take this to production-ready quality.\n\nWould you like me to dive deeper into any specific aspect?`,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col gap-0 animate-fade-in">
        {/* Header */}
        <div className="card rounded-b-none border-b-0 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-surface-900 dark:text-surface-100 text-sm">Aaroh AI Mentor</h2>
            <p className="text-xs text-accent-500">Online • Context-aware</p>
          </div>

          {/* Project selector */}
          <div className="relative">
            <select
              value={activeProject.id}
              onChange={e => {
                const p = mockProjects.find(p => p.id === e.target.value);
                if (p) setActiveProject(p);
              }}
              className="input text-xs py-1.5 pl-2 pr-7 appearance-none cursor-pointer"
            >
              {mockProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setMessages([])}
            className="btn-ghost p-2"
            title="Clear chat"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 border-t-0 border-b-0 px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                <Zap size={28} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-1">Start a conversation</h3>
                <p className="text-sm text-muted max-w-xs">Ask me anything about your project. I have full context about your architecture, health scores, and roadmap.</p>
              </div>
            </div>
          )}

          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts */}
        {messages.length <= 3 && (
          <div className="bg-surface-50 dark:bg-surface-900 border-x border-surface-200 dark:border-surface-700 px-4 py-3">
            <p className="text-xs text-muted mb-2">Suggested prompts:</p>
            <div className="flex gap-2 flex-wrap">
              {suggestedPrompts.slice(0, 3).map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors bg-white dark:bg-surface-800"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="card rounded-t-none border-t-0 px-4 py-3 flex gap-3 items-end flex-shrink-0">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your project... (Enter to send, Shift+Enter for newline)"
            className="input flex-1 resize-none overflow-hidden min-h-[40px]"
            style={{ height: '40px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="btn-primary p-2.5 flex-shrink-0 disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
