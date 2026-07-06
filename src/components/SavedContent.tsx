import { useStore } from '../store';
import { Copy, Trash2, Twitter, Linkedin, ExternalLink, Bookmark, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PreviewCard } from './PreviewCard';
import { Post } from '../types';

export function SavedContent() {
  const { posts, deletePost } = useStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags || []))).sort();

  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags?.includes(selectedTag))
    : posts;

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === 'twitter') return <Twitter className="w-4 h-4 text-sky-400" />;
    if (platform === 'linkedin') return <Linkedin className="w-4 h-4 text-blue-600" />;
    return null;
  };

  return (
    <div className="h-full w-full bg-[#0a0f1e] overflow-y-auto p-4 sm:p-8 relative">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Saved Content</h1>
            <p className="text-sm sm:text-base text-slate-400">View and manage your saved drafts and posts.</p>
          </div>
          <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50 self-start sm:self-auto">
            <span className="text-slate-300 font-medium">{filteredPosts.length}</span>
            <span className="text-slate-500 ml-2">Total Items</span>
          </div>
        </header>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-800">
            <button
              onClick={() => setSelectedTag(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                selectedTag === null
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              )}
            >
              All Tags
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  selectedTag === tag
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-1">No content found</h3>
            <p className="text-slate-500 max-w-sm">
              {posts.length === 0 ? "Generate some content in the Studio and save it. It will appear here." : "No posts match the selected tag."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col group hover:border-slate-700 transition-colors"
                >
                  <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(post.platform)}
                      <span className="text-xs font-medium text-slate-400 capitalize">{post.platform}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {format(new Date(post.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  <div 
                    className="p-5 flex-1 overflow-hidden relative cursor-pointer"
                    onClick={() => setPreviewPost(post)}
                  >
                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-6 whitespace-pre-wrap group-hover:text-slate-200 transition-colors">
                      {post.content}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
                    
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg shadow-indigo-500/20">
                        <ExternalLink className="w-4 h-4" />
                        Preview Post
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-800/50 bg-slate-900 flex items-center justify-between z-10 relative">
                    <div className="flex flex-wrap gap-2">
                      {post.tags?.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[10px] font-medium px-2 py-1 bg-slate-800 text-slate-300 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(post.id, post.content)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        title="Copy content"
                      >
                        {copiedId === post.id ? <span className="text-xs font-medium text-emerald-400 px-1">Copied!</span> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {previewPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewPost(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Platform Preview</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(previewPost.id, previewPost.content)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-xs transition-colors"
                  >
                    {copiedId === previewPost.id ? <span className="text-emerald-400">Copied!</span> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                  <button
                    onClick={() => setPreviewPost(null)}
                    className="p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0a0f1e] rounded-b-2xl">
                <div className="max-w-lg mx-auto">
                  <PreviewCard content={previewPost.content} platform={previewPost.platform} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
