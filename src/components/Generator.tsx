import { useState, useRef, useEffect } from 'react';
import { Send, Twitter, Linkedin, Sparkles, Copy, Save, Check, RefreshCw, Link as LinkIcon, Download, ChevronDown } from 'lucide-react';
import { useStore } from '../store';
import { Platform } from '../types';
import { cn } from '../lib/utils';
import { generateContent } from '../lib/ai';
import { PreviewCard } from './PreviewCard';
import { calculateFleschKincaid, analyzeSentiment } from '../lib/contentHealth';
import { motion, AnimatePresence } from 'motion/react';

export function Generator() {
  const { settings, addPost } = useStore();
  const [prompt, setPrompt] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [platform, setPlatform] = useState<Platform>('twitter');
  const [tone, setTone] = useState('Professional');
  
  const [customTags, setCustomTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Variations
  const [variations, setVariations] = useState<string[]>([]);
  const [activeVariationIndex, setActiveVariationIndex] = useState(0);

  const activeContent = variations.length > 0 ? variations[activeVariationIndex] : generatedContent;

  const handleScrape = async () => {
    if (!sourceUrl) return;
    setIsScraping(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourceUrl })
      });
      if (res.ok) {
        const data = await res.json();
        const existingPrompt = prompt ? prompt + '\n\n' : '';
        setPrompt(existingPrompt + `[Source: ${data.title}]\n${data.content}`);
        setSourceUrl('');
      } else {
        alert("Failed to scrape the URL. It might be protected or inaccessible.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to scrape the URL.");
    }
    setIsScraping(false);
  };

  const handleGenerate = async (count: number = 1) => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const systemPrompt = `You are an expert social media manager and copywriter. 
Write a highly engaging ${platform} post based on the following topic. Extract the most interesting insights from the provided text.
Tone: ${tone}.

CRITICAL FORMATTING RULES:
1. Do NOT use markdown like **bold**, *italics*, or # headers. Social media platforms do not support them.
2. Use natural spacing (line breaks) to make it readable.
3. ${platform === 'twitter' ? 'Write a comprehensive, engaging tweet or thread (2-3 tweets). Aim for at least 3-4 sentences of meaningful insight.' : 'Structure the LinkedIn post clearly: explicitly include a hook, an engaging body with key points, and a clear "Takeaway:" section at the end.'}
4. For both Twitter and LinkedIn, automatically identify relevant companies, people, departments or entities from the topic, and append them as tags (using @) alongside 3-5 relevant hashtags at the bottom.
5. ONLY output in English. Do not use bracketed placeholders or strange characters (e.g., avoid things like prompt{Takeaway_xy}).
6. Do NOT output any intro text like "Here is your post:". Return ONLY the raw post content.`;

      if (count > 1) {
        const batchPrompt = `${systemPrompt}\n\nUser Topic: ${prompt}\n\nPlease provide ${count} completely distinct variations of this post. Separate each variation EXACTLY with the string "---VARIATION_SPLIT---".`;
        const res = await generateContent(batchPrompt, settings);
        const parts = res.split('---VARIATION_SPLIT---').map(s => s.trim()).filter(Boolean);
        setVariations(parts.length > 0 ? parts : [res]);
        setActiveVariationIndex(0);
        setGeneratedContent(parts[0] || res);
      } else {
        const singlePrompt = `${systemPrompt}\n\nUser Topic: ${prompt}`;
        const res = await generateContent(singlePrompt, settings);
        setGeneratedContent(res);
        setVariations([res]);
        setActiveVariationIndex(0);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsSaved(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
    if (!activeContent) return;
    const additionalTags = customTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    addPost({
      content: activeContent,
      platform,
      status: 'backlog',
      tags: Array.from(new Set([tone.toLowerCase(), ...additionalTags]))
    });
    setIsSaved(true);
    setCustomTags('');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const charCount = activeContent.length;
  const isOverLimit = platform === 'twitter' && charCount > 280;

  const readability = calculateFleschKincaid(activeContent);
  const sentiment = analyzeSentiment(activeContent);

  return (
    <div className="flex flex-col lg:flex-row h-full max-h-screen overflow-hidden">
      {/* Editor Pane */}
      <div className="flex-1 flex flex-col border-r border-slate-800 bg-slate-950 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold mb-1 tracking-tight">AI Co-Pilot</h1>
            <p className="text-slate-400 text-sm">Draft, refine, and perfect your content.</p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Platform</label>
              <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                <button
                  onClick={() => setPlatform('twitter')}
                  className={cn("flex-1 flex justify-center items-center gap-2 py-2 text-xs font-medium rounded-md transition-all", platform === 'twitter' ? "bg-indigo-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200")}
                >
                  <Twitter className="w-4 h-4" /> <span>X (Twitter)</span>
                </button>
                <button
                  onClick={() => setPlatform('linkedin')}
                  className={cn("flex-1 flex justify-center items-center gap-2 py-2 text-xs font-medium rounded-md transition-all", platform === 'linkedin' ? "bg-indigo-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200")}
                >
                  <Linkedin className="w-4 h-4" /> <span>LinkedIn</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tone Profile</label>
              <div className="relative">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-3 pr-8 py-2.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option>Professional</option>
                  <option>Witty & Casual</option>
                  <option>Direct & Punchy</option>
                  <option>Storytelling</option>
                  <option>Contrarian</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* URL Scraper */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source Content (URL)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="Paste a blog or YouTube URL to read..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button
                onClick={handleScrape}
                disabled={isScraping || !sourceUrl.trim()}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap"
              >
                {isScraping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Fetch</span>
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2 relative">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Idea / Topic</label>
              <span className="text-[10px] text-slate-600 font-mono">Cmd + K to search</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What's on your mind? E.g., The future of local-first LLMs..."
              className="w-full h-40 bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleGenerate(1)}
              disabled={isLoading || !prompt.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-transform"
            >
              {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isLoading ? 'GENERATING...' : 'GENERATE CONTENT'}
            </button>
            <button
              onClick={() => handleGenerate(3)}
              disabled={isLoading || !prompt.trim()}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 px-5 py-4 rounded-xl font-bold text-sm tracking-wide transition-all"
              title="Generate 3 variations"
            >
              <RefreshCw className="w-4 h-4" />
              <span>3x</span>
            </button>
          </div>

          {/* Raw Text Editor */}
          {activeContent && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 pt-6 border-t border-slate-800 mt-4"
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Refine Raw Text</label>
                <div className="flex items-center gap-3">
                  {variations.length > 1 && (
                    <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                      {variations.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveVariationIndex(idx)}
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-medium rounded transition-colors",
                            activeVariationIndex === idx ? "bg-slate-800 text-slate-200" : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          V{idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                  {platform === 'twitter' && (
                    <span className={cn("text-xs font-mono font-medium", isOverLimit ? "text-red-400" : "text-slate-500")}>
                      {charCount} / 280
                    </span>
                  )}
                </div>
              </div>
              <textarea
                value={activeContent}
                onChange={(e) => {
                  const newContent = e.target.value;
                  const newVars = [...variations];
                  newVars[activeVariationIndex] = newContent;
                  setVariations(newVars);
                  if (variations.length === 0) setGeneratedContent(newContent);
                }}
                className="w-full h-48 bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
              />
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="text"
                  placeholder="Add tags (comma separated)..."
                  value={customTags}
                  onChange={(e) => setCustomTags(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                  {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                  {isSaved ? 'Saved' : 'Save Content'}
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Live Preview Pane */}
      <div className="hidden lg:flex flex-1 bg-[#0a0f1e] border-l border-slate-800 flex-col items-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Platform Preview</h2>
            </div>
            {variations.length > 1 && (
              <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                {variations.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveVariationIndex(idx)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded transition-colors",
                      activeVariationIndex === idx ? "bg-slate-800 text-slate-200" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    V{idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeVariationIndex + (activeContent.length % 10)} // Force slight re-render on active content chunks for animation
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col gap-6"
          >
            <PreviewCard content={activeContent} platform={platform} />
            
            {activeContent && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Content Health</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0a0f1e] rounded-lg p-3 border border-slate-800 flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Characters</span>
                    <span className={cn("text-lg font-bold", isOverLimit ? "text-red-400" : "text-slate-200")}>
                      {charCount}
                    </span>
                  </div>
                  
                  <div className="bg-[#0a0f1e] rounded-lg p-3 border border-slate-800 flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Readability</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-slate-200">{readability.score}</span>
                      <span className="text-[10px] font-medium text-slate-400 truncate">{readability.label}</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#0a0f1e] rounded-lg p-3 border border-slate-800 flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sentiment</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sentiment.emoji}</span>
                      <span className="text-xs font-medium text-slate-300 truncate">{sentiment.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
