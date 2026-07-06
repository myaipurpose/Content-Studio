import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, ThumbsUp, MessageSquare, Repeat, Send, Bookmark, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Platform } from '../types';

interface PreviewCardProps {
  content: string;
  platform: Platform;
  className?: string;
}

export function PreviewCard({ content, platform, className }: PreviewCardProps) {
  const isTwitter = platform === 'twitter';

  const avatarUrl = "https://ui-avatars.com/api/?name=Alex+Sterling&background=random";

  if (isTwitter) {
    return (
      <div className={cn("bg-white rounded-xl p-4 sm:p-5 text-slate-900 shadow-xl relative max-w-lg w-full mx-auto font-sans border border-slate-100", className)}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full shrink-0" />
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[15px] font-bold text-slate-900 truncate hover:underline cursor-pointer">Alex Sterling</span>
                <span className="text-[15px] text-slate-500 truncate">@alex_sterling</span>
                <span className="text-[15px] text-slate-500">·</span>
                <span className="text-[15px] text-slate-500 hover:underline cursor-pointer">2h</span>
              </div>
              <button className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full p-1.5 transition-colors -mr-2">
                <MoreHorizontal className="w-[18px] h-[18px]" />
              </button>
            </div>

            {/* Content */}
            <div className="text-[15px] text-slate-900 whitespace-pre-wrap leading-normal break-words">
              {content || <span className="text-slate-400 italic">Your generated content will appear here...</span>}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between mt-3 max-w-md">
              <button className="flex items-center gap-1.5 text-slate-500 hover:text-blue-500 group transition-colors">
                <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors -ml-2"><MessageCircle className="w-[18px] h-[18px]" /></div>
                <span className="text-[13px]">12</span>
              </button>
              <button className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-500 group transition-colors">
                <div className="p-2 rounded-full group-hover:bg-emerald-50 transition-colors -ml-2"><Repeat2 className="w-[18px] h-[18px]" /></div>
                <span className="text-[13px]">4</span>
              </button>
              <button className="flex items-center gap-1.5 text-slate-500 hover:text-pink-600 group transition-colors">
                <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors -ml-2"><Heart className="w-[18px] h-[18px]" /></div>
                <span className="text-[13px]">48</span>
              </button>
              <button className="flex items-center gap-1.5 text-slate-500 hover:text-blue-500 group transition-colors">
                <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors -ml-2"><BarChart3 className="w-[18px] h-[18px]" /></div>
                <span className="text-[13px]">1.2k</span>
              </button>
              <div className="flex items-center">
                <button className="flex items-center text-slate-500 hover:text-blue-500 group transition-colors">
                  <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors"><Bookmark className="w-[18px] h-[18px]" /></div>
                </button>
                <button className="flex items-center text-slate-500 hover:text-blue-500 group transition-colors">
                  <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors"><Share className="w-[18px] h-[18px]" /></div>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-tighter shadow-sm border-2 border-white">
          Preview
        </div>
      </div>
    );
  }

  // LinkedIn Format
  return (
    <div className={cn("bg-white rounded-lg sm:rounded-xl text-slate-900 shadow-lg relative max-w-lg w-full mx-auto font-sans border border-slate-200", className)}>
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 mb-2">
        <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full shrink-0 object-cover" />
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold hover:text-blue-600 cursor-pointer truncate">Alex Sterling</span>
            <button className="text-slate-500 hover:bg-slate-100 rounded-full p-1 transition-colors -mr-1">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <span className="text-[12px] text-slate-500 truncate leading-tight mt-0.5">Independent Creator</span>
          <div className="flex items-center text-[12px] text-slate-500 leading-tight mt-0.5">
            <span>2d • </span>
            <svg className="w-3.5 h-3.5 ml-1 fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.25a5.75 5.75 0 110 11.5A5.75 5.75 0 018 2.25zM5.5 8a5.25 5.25 0 012-4.75v9.5A5.25 5.25 0 015.5 8zm3-4.75a5.25 5.25 0 012 4.75 5.25 5.25 0 01-2 4.75v-9.5z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 text-[14px] text-slate-900 whitespace-pre-wrap leading-[1.4] break-words">
        {content || <span className="text-slate-400 italic">Your generated content will appear here...</span>}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between px-4 mt-3 pb-2 text-[12px] text-slate-500 border-b border-slate-200">
        <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 hover:underline">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center border border-white z-10"><ThumbsUp className="w-2 h-2 text-white fill-current" /></div>
            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border border-white z-0"><Heart className="w-2 h-2 text-white fill-current" /></div>
          </div>
          <span className="ml-1">244</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="hover:underline cursor-pointer">4 comments</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">7 reposts</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-2 py-1">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded hover:bg-slate-100 text-slate-500 font-semibold transition-colors">
          <ThumbsUp className="w-5 h-5 -scale-x-100" />
          <span className="text-[14px]">Like</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded hover:bg-slate-100 text-slate-500 font-semibold transition-colors">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[14px]">Comment</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded hover:bg-slate-100 text-slate-500 font-semibold transition-colors">
          <Repeat className="w-5 h-5" />
          <span className="text-[14px]">Repost</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded hover:bg-slate-100 text-slate-500 font-semibold transition-colors">
          <Send className="w-5 h-5" />
          <span className="text-[14px]">Send</span>
        </button>
      </div>
      
      <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-tighter shadow-sm border-2 border-white">
        Preview
      </div>
    </div>
  );
}
