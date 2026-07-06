import { LayoutDashboard, Settings, ChevronRight, Bookmark } from 'lucide-react';
import { View } from '../App';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { motion } from 'motion/react';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems: { id: View; label: string; icon: any; shortcut: string }[] = [
    { id: 'studio', label: 'Studio', icon: LayoutDashboard, shortcut: '⌘1' },
    { id: 'saved', label: 'Saved Content', icon: Bookmark, shortcut: '⌘2' },
    { id: 'settings', label: 'Settings', icon: Settings, shortcut: '⌘3' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? 240 : 64 }}
        className="hidden md:flex bg-[#020617] border-r border-slate-800 flex-col transition-all duration-300 ease-in-out relative z-20 shrink-0 h-full"
      >
        <div className="p-4 flex items-center justify-between">
          <div className={cn("flex items-center gap-3 overflow-hidden", !isExpanded && "opacity-0 w-0 hidden")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <span className="font-bold text-white text-lg">C</span>
            </div>
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">Content <span className="text-indigo-400 font-medium">Studio</span></span>
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 transition-colors mx-auto"
          >
            <ChevronRight className={cn("w-5 h-5 transition-transform duration-300", isExpanded && "rotate-180")} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-indigo-500/10 text-indigo-400" 
                    : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                )}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-indigo-400" : "group-hover:text-slate-300")} />
                {isExpanded && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {item.shortcut && (
                      <span className="ml-auto text-xs text-slate-500 font-mono tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.shortcut}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className={cn("p-4 border-t border-slate-800 text-xs text-slate-500", !isExpanded && "hidden")}>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-slate-950/50">
            <span className="font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">⌘K</span>
            <span>Command Palette</span>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden flex items-center justify-around bg-[#020617] border-t border-slate-800 h-[calc(4rem+env(safe-area-inset-bottom))] px-4 safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                isActive 
                  ? "text-indigo-400" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-indigo-500/20")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
