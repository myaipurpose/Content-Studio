import { useStore } from '../store';
import { Save, Upload, Download, Key, Server } from 'lucide-react';
import React, { useState } from 'react';
import { AIProvider } from '../types';
import { motion } from 'motion/react';
import { generateContent } from '../lib/ai';

export function SettingsView() {
  const { settings, updateSettings, posts, importData } = useStore();
  
  const [provider, setProvider] = useState<AIProvider>(settings.provider || 'openrouter');
  const [testStatus, setTestStatus] = useState<{status: 'idle'|'testing'|'success'|'error', message: string}>({status: 'idle', message: ''});
  
  const [apiKeys, setApiKeys] = useState({
    openrouter: settings.openRouterApiKey || '',
    groq: settings.groqApiKey || '',
    nvidia: settings.nvidiaApiKey || '',
    gemini: settings.geminiApiKey || ''
  });

  const [models, setModels] = useState({
    openrouter: settings.openRouterModel || settings.model || 'anthropic/claude-3.5-sonnet',
    groq: settings.groqModel || 'llama-3.3-70b-versatile',
    nvidia: settings.nvidiaModel || 'meta/llama3-70b-instruct',
    gemini: settings.geminiModel || 'gemini-2.5-flash'
  });

  const [saved, setSaved] = useState(false);
  const [dynamicModels, setDynamicModels] = useState<{id: string, name: string}[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const fetchModels = async (currentProvider: AIProvider, key: string) => {
    setIsLoadingModels(true);
    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: currentProvider, apiKey: key })
      });
      if (res.ok) {
        const data = await res.json();
        setDynamicModels(data.models || []);
      } else {
        setDynamicModels([]);
      }
    } catch (e) {
      console.error(e);
      setDynamicModels([]);
    }
    setIsLoadingModels(false);
  };

  React.useEffect(() => {
    fetchModels(provider, apiKeys[provider]);
  }, [provider, apiKeys[provider]]);

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    if (settings.fallbackProvider === newProvider) {
      updateSettings({ fallbackProvider: 'none' });
    }
    setTestStatus({ status: 'idle', message: '' });
  };

  const handleTestConnection = async () => {
    setTestStatus({ status: 'testing', message: 'Testing connection...' });
    try {
      const tempSettings = {
        ...settings,
        provider,
        openRouterApiKey: apiKeys.openrouter,
        groqApiKey: apiKeys.groq,
        nvidiaApiKey: apiKeys.nvidia,
        geminiApiKey: apiKeys.gemini,
        openRouterModel: models.openrouter,
        groqModel: models.groq,
        nvidiaModel: models.nvidia,
        geminiModel: models.gemini
      };
      await generateContent("Hi. Reply with exactly one word: 'Hello'.", tempSettings);
      setTestStatus({ status: 'success', message: 'Connection successful!' });
    } catch (error: any) {
      setTestStatus({ status: 'error', message: error.message || 'Connection failed.' });
    }
  };

  const handleSave = () => {
    updateSettings({
      provider,
      openRouterApiKey: apiKeys.openrouter,
      groqApiKey: apiKeys.groq,
      nvidiaApiKey: apiKeys.nvidia,
      geminiApiKey: apiKeys.gemini,
      openRouterModel: models.openrouter,
      groqModel: models.groq,
      nvidiaModel: models.nvidia,
      geminiModel: models.gemini
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = JSON.stringify({ settings, posts }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-studio-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        importData(data);
        
        // Update local state to reflect imported data
        const importedSettings = data.settings || {};
        setProvider(importedSettings.provider || 'openrouter');
        setApiKeys({
          openrouter: importedSettings.openRouterApiKey || '',
          groq: importedSettings.groqApiKey || '',
          nvidia: importedSettings.nvidiaApiKey || '',
          gemini: importedSettings.geminiApiKey || ''
        });
        setModels({
          openrouter: importedSettings.openRouterModel || importedSettings.model || 'anthropic/claude-3.5-sonnet',
          groq: importedSettings.groqModel || 'llama-3.3-70b-versatile',
          nvidia: importedSettings.nvidiaModel || 'meta/llama3-70b-instruct',
          gemini: importedSettings.geminiModel || 'gemini-2.5-flash'
        });
        
        alert('Data imported successfully!');
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 sm:space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-slate-100">Settings</h1>
        <p className="text-slate-400">Manage your API connections and preferences.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-200">
          <Server className="w-5 h-5 text-indigo-400" />
          AI Provider Selection
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Active Provider</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'openrouter', label: 'OpenRouter' },
                { id: 'groq', label: 'Groq' },
                { id: 'nvidia', label: 'NVIDIA NIM' },
                { id: 'gemini', label: 'Google Gemini' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProviderChange(p.id as AIProvider)}
                  className={`py-3 px-4 rounded-xl text-sm font-bold tracking-wide transition-all ${
                    provider === p.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Fallback Provider</label>
            <p className="text-xs text-slate-400 mb-3">If the active provider fails, we'll try this one instead.</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { id: 'none', label: 'None' },
                { id: 'openrouter', label: 'OpenRouter' },
                { id: 'groq', label: 'Groq' },
                { id: 'nvidia', label: 'NVIDIA NIM' },
                { id: 'gemini', label: 'Google Gemini' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => updateSettings({ fallbackProvider: p.id as AIProvider | 'none' })}
                  disabled={provider === p.id}
                  className={`py-3 px-4 rounded-xl text-sm font-bold tracking-wide transition-all ${
                    (settings.fallbackProvider || 'none') === p.id 
                      ? 'bg-slate-700 text-white shadow-lg shadow-slate-900/20' 
                      : provider === p.id 
                      ? 'bg-slate-950/50 border border-slate-800/50 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-200 mb-4">
              <Key className="w-4 h-4 text-indigo-400" />
              Configure {provider.charAt(0).toUpperCase() + provider.slice(1)}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">API Key</label>
                <input
                  type="password"
                  value={apiKeys[provider]}
                  onChange={(e) => setApiKeys({ ...apiKeys, [provider]: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  placeholder={
                    provider === 'openrouter' ? 'sk-or-v1-...' :
                    provider === 'groq' ? 'gsk_...' :
                    provider === 'nvidia' ? 'nvapi-...' : 'AIza...'
                  }
                />
              </div>

              <div className="pt-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Model ID</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={models[provider]}
                    onChange={(e) => setModels({ ...models, [provider]: e.target.value })}
                    placeholder="e.g. poolside/laguna-xs-2.1:free"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  />
                  <button
                    onClick={handleTestConnection}
                    disabled={testStatus.status === 'testing' || !apiKeys[provider]?.trim()}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-sm tracking-wide transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {testStatus.status === 'testing' ? 'TESTING...' : 'TEST'}
                  </button>
                </div>

                <select
                  value={models[provider]}
                  onChange={(e) => setModels({ ...models, [provider]: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
                >
                  <option value="" disabled>{isLoadingModels ? "Loading models..." : "Or choose a model from the list..."}</option>
                  {!isLoadingModels && dynamicModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>

                {testStatus.message && (
                  <div className={`text-xs mt-3 p-3 rounded-lg border ${
                    testStatus.status === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : testStatus.status === 'error'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {testStatus.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors w-full sm:w-auto justify-center"
          >
            <Save className="w-4 h-4" />
            {saved ? 'SAVED!' : 'SAVE SETTINGS'}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-semibold text-slate-200">Data Management</h2>
        <p className="text-sm text-slate-400">Back up your posts, ideas, and settings to a local JSON file.</p>
        
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors"
          >
            <Download className="w-4 h-4" />
            EXPORT DATA
          </button>
          
          <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            IMPORT DATA
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
