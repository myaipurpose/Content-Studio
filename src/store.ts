import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Post } from './types';

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      posts: [],
      settings: {
        provider: 'openrouter',
        openRouterApiKey: '',
        groqApiKey: '',
        nvidiaApiKey: '',
        geminiApiKey: '',
        openRouterModel: 'anthropic/claude-3.5-sonnet',
        groqModel: 'llama-3.3-70b-versatile',
        nvidiaModel: 'meta/llama3-70b-instruct',
        geminiModel: 'gemini-2.5-flash',
      },
      addPost: (postData) =>
        set((state) => ({
          posts: [
            ...state.posts,
            { ...postData, id: crypto.randomUUID(), createdAt: Date.now() },
          ],
        })),
      updatePost: (id, updates) =>
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === id ? { ...post, ...updates } : post
          ),
        })),
      deletePost: (id) =>
        set((state) => ({
          posts: state.posts.filter((post) => post.id !== id),
        })),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      importData: (data) => set((state) => ({
        posts: data.posts || [],
        settings: { ...state.settings, ...(data.settings || {}) }
      })),
    }),
    {
      name: 'content-studio-storage',
    }
  )
);
