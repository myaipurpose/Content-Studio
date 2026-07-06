export type Platform = 'twitter' | 'linkedin';
export type PostStatus = 'backlog' | 'draft' | 'ready' | 'scheduled';
export type AIProvider = 'openrouter' | 'groq' | 'nvidia' | 'gemini';

export interface Post {
  id: string;
  content: string;
  platform: Platform;
  status: PostStatus;
  createdAt: number;
  scheduledDate?: number;
  tags: string[];
}

export interface Settings {
  provider: AIProvider;
  fallbackProvider?: AIProvider | 'none';
  openRouterApiKey: string;
  groqApiKey: string;
  nvidiaApiKey: string;
  geminiApiKey: string;
  openRouterModel: string;
  groqModel: string;
  nvidiaModel: string;
  geminiModel: string;
  model?: string; // Legacy support
}

export interface AppState {
  posts: Post[];
  settings: Settings;
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  importData: (data: any) => void;
}
