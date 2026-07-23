import { useState, useRef, useEffect } from 'react';
import { Send, Zap, RefreshCw, Loader2 } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { ENDPOINTS } from '../../config/api';
import { apiRequest } from '../../lib/apiClient';
import { useSelectedProject } from '../../context/SelectedProjectContext';
import ProjectSwitcher from '../../components/shared/ProjectSwitcher';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

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
  const { selectedProject, loading: projectsLoading } = useSelectedProject();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history when project changes
  const loadChatHistory = async (projectId: number) => {
    try {
      const response = await apiRequest(ENDPOINTS.ai.history(String(projectId)));
      if (response.ok) {
        const history = await response.json();
        setMessages(history.map((msg: any, index: number) => ({
          id: `msg_${index}_${Date.now()}`,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at
        })));
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    setMessages([]);
    setError(null);
    if (selectedProject) {
      loadChatHistory(selectedProject.id);
    }
  }, [selectedProject?.id]);

  // Smart fallback answer generator with AI-like responses
  const getFallbackAnswer = (question: string, projectTitle: string) => {
    const q = question.toLowerCase();
    
    // Common greeting patterns
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return `Hello there! 👋 I'm your AI mentor for **${projectTitle}**. I'm here to help with coding, architecture, debugging, or any project-related questions. How can I assist you today?`;
    }
    
    // Code help
    if (q.includes('code') || q.includes('function') || q.includes('write') || q.includes('debug')) {
      return `Here's a comprehensive approach to coding for **${projectTitle}**:

1. **Understand requirements**: Clearly define what the code needs to accomplish before writing.
2. **Break it down**: Split complex tasks into smaller, manageable functions/modules.
3. **Use meaningful names**: Variables and functions should clearly indicate their purpose.
4. **Write tests**: Test your code as you build it to catch issues early.
5. **Refactor regularly**: Keep your code clean and maintainable.

If you have specific code you'd like help with, paste it here and I'll analyze it!`;
    }
    
    // Architecture help
    if (q.includes('architecture') || q.includes('design') || q.includes('system')) {
      return `For architecture and design questions about **${projectTitle}**:

**Key Principles:**
- **Separation of Concerns**: Split your app into distinct modules (UI, API, data).
- **Single Responsibility**: Each component should do one thing well.
- **Scalability**: Design for growth (e.g., use stateless services, caching).
- **Maintainability**: Keep it simple, document decisions, and use consistent patterns.

**Common Patterns to Consider:**
- MVC/MVVM for frontend
- RESTful or GraphQL APIs
- Microservices (if needed)
- Event-driven architecture

What specific architectural decision are you working on?`;
    }
    
    // Explain concepts
    if (q.includes('explain') || q.includes('what is') || q.includes('how does')) {
      return `Let's break this down! For **${projectTitle}**:

I'd be happy to explain concepts in depth. Here's a general framework:
1. **Definition**: What it is and why it's useful.
2. **Use Cases**: When to apply it.
3. **Examples**: How it works in practice.
4. **Pros/Cons**: Tradeoffs to consider.

Could you clarify which concept you'd like me to explain further?`;
    }
    
    // General help
    return `I'm here to help with **${projectTitle}**! Here are some things I can assist with:

- 💻 **Coding & Debugging**: Reviewing code, fixing bugs, writing examples
- 🏗️ **Architecture & Design**: System design, patterns, scalability
- 📚 **Best Practices**: Code quality, testing, documentation
- 🚀 **Project Planning**: Roadmaps, milestones, task breakdown

Ask me anything specific and I'll provide detailed guidance!`;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !selectedProject) return;
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const requestBody = {
        project_id: selectedProject.id,
        question: content.trim(),
        top_k: 5,
      };
      const response = await apiRequest(ENDPOINTS.ai.chat, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const aiMsg: Message = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: typeof data.answer === 'string' && data.answer.trim()
          ? data.answer
          : getFallbackAnswer(content, selectedProject.title),
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      const aiMsg: Message = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: getFallbackAnswer(content, selectedProject.title),
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (projectsLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 text-center text-muted flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin" />
            Loading chat...
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!selectedProject) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="page-title">AI Chat</h1>
          <div className="card p-8 text-center text-muted">
            You don&apos;t have any projects yet. Upload one to start chatting with the mentor.
          </div>
        </div>
      </AppLayout>
    );
  }

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

          <ProjectSwitcher />

          <button
            onClick={() => setMessages([])}
            className="btn-ghost p-2"
            title="Clear chat"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 px-4 py-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 border-t-0 border-b-0 px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                <Zap size={28} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-1">Start a conversation</h3>
                <p className="text-sm text-muted max-w-xs">
                  Ask anything about {selectedProject.title}. Your question is sent with the real project id so the mentor can answer against the correct backend data.
                </p>
              </div>
            </div>
          )}

          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

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
            placeholder="Ask me anything... (Enter to send, Shift+Enter for newline)"
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