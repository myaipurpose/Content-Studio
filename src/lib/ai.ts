import { Settings } from '../types';

export async function generateContent(prompt: string, settings: Settings) {
  const { provider } = settings;

  const apiKey = 
    provider === 'openrouter' ? settings.openRouterApiKey :
    provider === 'groq' ? settings.groqApiKey :
    provider === 'nvidia' ? settings.nvidiaApiKey :
    provider === 'gemini' ? settings.geminiApiKey : '';

  if (!apiKey) {
    throw new Error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key is required. Please set it in Settings.`);
  }

  const model = 
    provider === 'openrouter' ? (settings.openRouterModel || settings.model || 'anthropic/claude-3.5-sonnet') :
    provider === 'groq' ? (settings.groqModel || 'llama-3.3-70b-versatile') :
    provider === 'nvidia' ? (settings.nvidiaModel || 'meta/llama3-70b-instruct') :
    provider === 'gemini' ? (settings.geminiModel || 'gemini-2.5-flash') : '';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider,
        apiKey,
        model,
        prompt
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to generate content from ${provider}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error: any) {
    if (settings.fallbackProvider && settings.fallbackProvider !== 'none' && settings.fallbackProvider !== provider) {
      console.warn(`Primary provider ${provider} failed, trying fallback ${settings.fallbackProvider}...`);
      // Create a temporary settings object overriding the main provider with the fallback
      const fallbackSettings = { ...settings, provider: settings.fallbackProvider };
      return generateContent(prompt, fallbackSettings);
    }
    throw error;
  }
}
