// API Configuration — swap these base URLs when connecting to the FastAPI backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
  // AI
  ai: {
    chat: `${API_BASE_URL}/ai/chat`,
    analyze: (projectId: string) => `${API_BASE_URL}/ai/analyze/${projectId}`,
  },
  // Health
  health: {
    report: (projectId: string) => `${API_BASE_URL}/health/${projectId}`,
    history: (projectId: string) => `${API_BASE_URL}/health/${projectId}/history`,
  },
  // Roadmap
  roadmap: {
    get: (projectId: string) => `${API_BASE_URL}/roadmap/${projectId}`,
    update: (projectId: string, milestoneId: string) =>
      `${API_BASE_URL}/roadmap/${projectId}/milestones/${milestoneId}`,
  },
  // Architecture
  architecture: {
    get: (projectId: string) => `${API_BASE_URL}/architecture/${projectId}`,
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

