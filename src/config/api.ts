// API Configuration — swap these base URLs when connecting to the FastAPI backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gen-ai-and-agentic-ai.onrender.com';

export const ENDPOINTS = {
  // Auth
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    signup: `${API_BASE_URL}/auth/signup`,
    logout: `${API_BASE_URL}/auth/logout`,
    me: `${API_BASE_URL}/auth/me`,
  },
  // Projects
  projects: {
    list: `${API_BASE_URL}/projects`,
    create: `${API_BASE_URL}/projects`,
    get: (id: string) => `${API_BASE_URL}/projects/${id}`,
    update: (id: string) => `${API_BASE_URL}/projects/${id}`,
    delete: (id: string) => `${API_BASE_URL}/projects/${id}`,
  },
  // Upload
  upload: {
    text: `${API_BASE_URL}/upload/text`,
    voice: `${API_BASE_URL}/upload/voice`,
    github: `${API_BASE_URL}/upload/github`,
    zip: `${API_BASE_URL}/upload/zip`,
    status: (jobId: string) => `${API_BASE_URL}/upload/status/${jobId}`,
  },
  // Repo Intelligence
  repoIntel: {
    analyzeGithub: `${API_BASE_URL}/repo-intel/analyze`,
    analyzeZip: `${API_BASE_URL}/repo-intel/analyze-zip`,
  },
  // AI
  ai: {
  chat: `${API_BASE_URL}/api/mentor/ask`,
  history: (projectId: string) => `${API_BASE_URL}/api/mentor/history/${projectId}`,
},
  // Health
  health: {
    report: (projectId: string) => `${API_BASE_URL}/health/${projectId}`,
    history: (projectId: string) => `${API_BASE_URL}/health/${projectId}/history`,
  },
  // Roadmap
  roadmap: {
    get: (projectId: string) => `${API_BASE_URL}/roadmaps/project/${projectId}`,
  },
  // Architecture
  architecture: {
    get: (projectId: string) => `${API_BASE_URL}/api/architecture/${projectId}`,
  },
  // Analytics
  analytics: {
    get: (projectId: string) => `${API_BASE_URL}/analytics/${projectId}`,
  },
  // Report
  report: {
    pdf: (projectId: string) => `${API_BASE_URL}/report/${projectId}/pdf`,
  },
  // Contact
  contact: {
    send: `${API_BASE_URL}/contact`,
  },
};