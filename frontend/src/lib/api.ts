const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('learnsmart_token');
}

export function setToken(token: string) {
  localStorage.setItem('learnsmart_token', token);
}

export function clearToken() {
  localStorage.removeItem('learnsmart_token');
  localStorage.removeItem('learnsmart_user');
}

export function getUser(): { id: string; name: string; email: string; diagnosticCompleted: boolean } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('learnsmart_user');
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: { id: string; name: string; email: string; diagnosticCompleted: boolean }) {
  localStorage.setItem('learnsmart_user', JSON.stringify(user));
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data as T;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ token: string; user: ReturnType<typeof getUser> }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: ReturnType<typeof getUser> }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getDiagnostic: () =>
    request<{ questions: QuizQuestion[] }>('/api/quiz/diagnostic'),

  submitDiagnostic: (answers: AnswerSubmission[]) =>
    request<{ results: QuizResult[]; masteryMap: Record<string, number> }>(
      '/api/quiz/diagnostic/submit',
      { method: 'POST', body: JSON.stringify({ answers }) }
    ),

  getAdaptiveQuiz: () =>
    request<{ questions: QuizQuestion[]; count: number }>('/api/quiz/adaptive'),

  submitAdaptive: (answers: AnswerSubmission[]) =>
    request<AdaptiveResult>('/api/quiz/adaptive/submit', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  getDashboard: () => request<DashboardData>('/api/dashboard'),

  getHistory: () =>
    request<{ improvementOverTime: { date: string; accuracy: number; attempts: number }[] }>(
      '/api/history'
    ),
};

export interface QuizQuestion {
  id: string;
  skill: string;
  difficulty: string;
  text: string;
  options: string[];
  targetMastery?: number;
  recommendedDifficulty?: string;
}

export interface AnswerSubmission {
  questionId: string;
  selectedOption: number;
}

export interface QuizResult {
  questionId: string;
  skill: string;
  correct: boolean;
  updatedMastery: number;
}

export interface DashboardData {
  skills: {
    skill: string;
    masteryScore: number;
    masteryPercent: number;
    level: 'weak' | 'moderate' | 'strong';
  }[];
  masteryMap: Record<string, number>;
  weakestSkills: { skill: string; masteryScore: number; masteryPercent: number }[];
  learningPath: string[];
  nextTopic: {
    skill: string;
    masteryScore: number;
    masteryPercent: number;
    reason: string;
  } | null;
  analytics: {
    averageMastery: number;
    averageMasteryPercent: number;
    weakestSkill: { skill: string; masteryScore: number };
    strongestSkill: { skill: string; masteryScore: number };
  };
  recommendations: {
    skill: string;
    masteryScore?: number;
    explanation: string;
    commonError?: string;
    suggestedAction?: string;
  }[];
}

export interface AdaptiveResult {
  results: QuizResult[];
  summary: { total: number; correct: number; scorePercent: number };
  masteryMap: Record<string, number>;
  analytics: DashboardData['analytics'] & {
    weakestSkills: DashboardData['weakestSkills'];
    learningPath: string[];
    nextTopic: DashboardData['nextTopic'];
  };
  recommendations: {
    skill: string;
    masteryScore: number;
    masteryPercent: number;
    explanation: string;
    commonError: string;
    suggestedAction: string;
  }[];
}
