// Mock data — replace with real API calls when backend is ready
// Each section maps to an endpoint in src/config/api.ts

export const mockUser = {
  id: 'u1',
  name: 'Alex Chen',
  email: 'alex@example.com',
  role: 'developer' as const,
  bio: 'Full-stack engineer passionate about AI-native products.',
  skills: ['React', 'TypeScript', 'Python', 'FastAPI', 'LLMs'],
  joinedAt: '2024-01-15',
  avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
};

export const mockProjects = [
  {
    id: 'p1',
    name: 'VectorSearch Engine',
    description: 'Semantic search engine using pgvector and LangChain',
    status: 'active' as const,
    healthScore: 87,
    lastUpdated: '2025-07-10',
    techStack: ['Python', 'FastAPI', 'pgvector', 'LangChain', 'React'],
    tags: ['AI', 'Search', 'Backend'],
  },
  {
    id: 'p2',
    name: 'Agentic Code Review Bot',
    description: 'Multi-agent system for automated code review and suggestions',
    status: 'analyzing' as const,
    healthScore: 72,
    lastUpdated: '2025-07-08',
    techStack: ['Python', 'OpenAI', 'GitHub API', 'Redis'],
    tags: ['AI', 'DevTools'],
  },
  {
    id: 'p3',
    name: 'RAG Knowledge Base',
    description: 'Retrieval-augmented generation system for enterprise docs',
    status: 'completed' as const,
    healthScore: 93,
    lastUpdated: '2025-07-01',
    techStack: ['Python', 'Pinecone', 'GPT-4', 'Next.js'],
    tags: ['RAG', 'Enterprise'],
  },
];

export const mockHealthReport = {
  projectId: 'p1',
  overallScore: 87,
  lastAnalyzed: '2025-07-10T14:32:00Z',
  categories: [
    {
      name: 'Architecture',
      score: 91,
      status: 'excellent' as const,
      summary: 'Well-structured microservices with clear separation of concerns.',
      issues: ['Consider adding circuit breakers for external API calls'],
    },
    {
      name: 'Scalability',
      score: 84,
      status: 'good' as const,
      summary: 'Horizontal scaling supported, but database connection pooling needs tuning.',
      issues: ['Database connection pool size may be insufficient at scale', 'Add caching layer for frequent queries'],
    },
    {
      name: 'Documentation',
      score: 78,
      status: 'good' as const,
      summary: 'README is complete. API docs partially missing.',
      issues: ['Missing OpenAPI docs for 3 endpoints', 'Add architecture decision records (ADRs)'],
    },
    {
      name: 'Code Quality',
      score: 89,
      status: 'excellent' as const,
      summary: 'Clean code, good test coverage at 82%.',
      issues: ['Increase test coverage for vector search module'],
    },
    {
      name: 'Security',
      score: 85,
      status: 'good' as const,
      summary: 'Auth implemented correctly. Dependency audit clean.',
      issues: ['Enable rate limiting on public endpoints', 'Add input sanitization for LLM prompts'],
    },
    {
      name: 'Performance',
      score: 82,
      status: 'good' as const,
      summary: 'Median response time 120ms. P99 at 890ms needs attention.',
      issues: ['Optimize vector similarity query index', 'Implement response streaming'],
    },
  ],
};

export const mockRoadmap = {
  projectId: 'p1',
  milestones: [
    {
      id: 'm1',
      title: 'Project Scaffold & Core Setup',
      status: 'completed' as const,
      dueDate: '2025-06-01',
      description: 'Initialize repo, set up CI/CD, configure database and base API.',
      tasks: [
        { id: 't1', title: 'Initialize FastAPI project', done: true },
        { id: 't2', title: 'Set up PostgreSQL + pgvector', done: true },
        { id: 't3', title: 'Configure Docker + docker-compose', done: true },
        { id: 't4', title: 'Set up GitHub Actions CI', done: true },
      ],
    },
    {
      id: 'm2',
      title: 'Vector Search Implementation',
      status: 'completed' as const,
      dueDate: '2025-06-20',
      description: 'Implement embedding generation, storage, and semantic search.',
      tasks: [
        { id: 't5', title: 'Integrate OpenAI embedding model', done: true },
        { id: 't6', title: 'Build vector ingestion pipeline', done: true },
        { id: 't7', title: 'Implement semantic search endpoint', done: true },
        { id: 't8', title: 'Add hybrid search (keyword + vector)', done: true },
      ],
    },
    {
      id: 'm3',
      title: 'LangChain Reasoning Layer',
      status: 'in_progress' as const,
      dueDate: '2025-07-20',
      description: 'Add multi-step reasoning and context-aware responses.',
      tasks: [
        { id: 't9', title: 'Build retrieval chain', done: true },
        { id: 't10', title: 'Add conversation memory', done: true },
        { id: 't11', title: 'Implement re-ranking', done: false },
        { id: 't12', title: 'Build query decomposition agent', done: false },
      ],
    },
    {
      id: 'm4',
      title: 'API Optimization & Caching',
      status: 'pending' as const,
      dueDate: '2025-08-05',
      description: 'Performance tuning, caching layer, and rate limiting.',
      tasks: [
        { id: 't13', title: 'Add Redis caching', done: false },
        { id: 't14', title: 'Implement rate limiting', done: false },
        { id: 't15', title: 'Profile and optimize hot paths', done: false },
      ],
    },
    {
      id: 'm5',
      title: 'Frontend & Deployment',
      status: 'pending' as const,
      dueDate: '2025-08-25',
      description: 'Build React frontend and deploy to production.',
      tasks: [
        { id: 't16', title: 'Build search UI in React', done: false },
        { id: 't17', title: 'Add result highlighting', done: false },
        { id: 't18', title: 'Deploy to AWS ECS', done: false },
        { id: 't19', title: 'Set up monitoring & alerting', done: false },
      ],
    },
  ],
};

export const mockArchitectureNodes = [
  { id: 'client', type: 'input', data: { label: 'React Frontend', sublabel: 'User Interface', color: 'blue' }, position: { x: 50, y: 200 } },
  { id: 'gateway', data: { label: 'API Gateway', sublabel: 'FastAPI', color: 'teal' }, position: { x: 280, y: 200 } },
  { id: 'auth', data: { label: 'Auth Service', sublabel: 'JWT / Supabase', color: 'orange' }, position: { x: 280, y: 80 } },
  { id: 'search', data: { label: 'Search Service', sublabel: 'LangChain + pgvector', color: 'green' }, position: { x: 510, y: 140 } },
  { id: 'ingestion', data: { label: 'Ingestion Pipeline', sublabel: 'OpenAI Embeddings', color: 'purple' }, position: { x: 510, y: 280 } },
  { id: 'postgres', type: 'output', data: { label: 'PostgreSQL', sublabel: 'pgvector extension', color: 'blue' }, position: { x: 740, y: 200 } },
  { id: 'redis', type: 'output', data: { label: 'Redis Cache', sublabel: 'In-memory cache', color: 'red' }, position: { x: 740, y: 80 } },
  { id: 'openai', type: 'output', data: { label: 'OpenAI API', sublabel: 'GPT-4 + Embeddings', color: 'gray' }, position: { x: 740, y: 320 } },
];

export const mockArchitectureEdges = [
  { id: 'e1', source: 'client', target: 'gateway', animated: true, label: 'REST/HTTPS' },
  { id: 'e2', source: 'gateway', target: 'auth', label: 'Validate JWT' },
  { id: 'e3', source: 'gateway', target: 'search', animated: true, label: 'Query' },
  { id: 'e4', source: 'gateway', target: 'ingestion', label: 'Ingest docs' },
  { id: 'e5', source: 'search', target: 'postgres', animated: true, label: 'Vector query' },
  { id: 'e6', source: 'search', target: 'redis', label: 'Cache hit' },
  { id: 'e7', source: 'ingestion', target: 'postgres', label: 'Store vectors' },
  { id: 'e8', source: 'ingestion', target: 'openai', label: 'Embed chunks' },
  { id: 'e9', source: 'search', target: 'openai', label: 'Completion' },
];

export const mockAnalytics = {
  commitActivity: [
    { week: 'Jun 1', commits: 12 },
    { week: 'Jun 8', commits: 19 },
    { week: 'Jun 15', commits: 8 },
    { week: 'Jun 22', commits: 24 },
    { week: 'Jun 29', commits: 15 },
    { week: 'Jul 6', commits: 31 },
    { week: 'Jul 13', commits: 22 },
  ],
  techStackBreakdown: [
    { name: 'Python', value: 45, color: '#3b82f6' },
    { name: 'TypeScript', value: 25, color: '#10b981' },
    { name: 'SQL', value: 15, color: '#f59e0b' },
    { name: 'YAML/Config', value: 10, color: '#8b5cf6' },
    { name: 'Other', value: 5, color: '#94a3b8' },
  ],
  healthScoreTrend: [
    { date: 'Jun 1', score: 61 },
    { date: 'Jun 15', score: 68 },
    { date: 'Jun 29', score: 74 },
    { date: 'Jul 6', score: 81 },
    { date: 'Jul 10', score: 87 },
  ],
  categoryScores: [
    { category: 'Architecture', score: 91 },
    { category: 'Scalability', score: 84 },
    { category: 'Docs', score: 78 },
    { category: 'Code Quality', score: 89 },
    { category: 'Security', score: 85 },
    { category: 'Performance', score: 82 },
  ],
  linesOfCode: 12847,
  fileCount: 68,
  testCoverage: 82,
  openIssues: 7,
};

export const mockChatMessages = [
  {
    id: 'msg1',
    role: 'assistant' as const,
    content: "Hi! I'm Aaroh, your AI project mentor. I've analyzed **VectorSearch Engine** and I'm ready to help. What would you like to explore — architecture, scalability, or the roadmap?",
    timestamp: '2025-07-10T10:00:00Z',
  },
  {
    id: 'msg2',
    role: 'user' as const,
    content: 'What are the biggest risks in my current architecture?',
    timestamp: '2025-07-10T10:01:00Z',
  },
  {
    id: 'msg3',
    role: 'assistant' as const,
    content: "Great question. Based on my analysis, here are the top 3 architectural risks:\n\n**1. Single Point of Failure — API Gateway**\nYour FastAPI gateway handles all routing without a load balancer or failover. At scale, this becomes a bottleneck.\n\n**2. Database Connection Pool**\nThe current pool size of 10 will saturate under concurrent vector queries. I recommend bumping to 50 and adding PgBouncer.\n\n**3. No Circuit Breaker for OpenAI API**\nIf OpenAI's API is slow, your entire ingestion pipeline backs up. Add a circuit breaker with exponential backoff.\n\nWant me to generate specific code fixes for any of these?",
    timestamp: '2025-07-10T10:01:30Z',
  },
];

export const mockRecentActivity = [
  { id: 'a1', type: 'analysis', project: 'VectorSearch Engine', description: 'Health analysis completed — score 87/100', time: '2 hours ago' },
  { id: 'a2', type: 'roadmap', project: 'Agentic Code Review Bot', description: 'Roadmap generated with 5 milestones', time: '1 day ago' },
  { id: 'a3', type: 'upload', project: 'RAG Knowledge Base', description: 'GitHub repo analyzed successfully', time: '3 days ago' },
  { id: 'a4', type: 'chat', project: 'VectorSearch Engine', description: 'Chat session: Architecture discussion', time: '3 days ago' },
  { id: 'a5', type: 'report', project: 'RAG Knowledge Base', description: 'PDF report exported', time: '6 days ago' },
];
