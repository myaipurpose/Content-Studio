import { Search, PenTool, LayoutDashboard, Calendar, Settings, X } from 'lucide-react';
import { View } from '../App';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CommandPaletteProps {
  onClose: () => void;
  onNavigate: (view: View) => void;
}

export function CommandPalette({ onClose, onNavigate }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commands = [
    { id: 'studio', label: 'Go to Studio (Workspace)', icon: LayoutDashboard, action: () => onNavigate('studio') },
    { id: 'settings', label: 'Go to Settings', icon: Settings, action: () => onNavigate('settings') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center px-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 px-4 py-4 text-slate-200 placeholder:text-slate-500"
          />
          <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-2">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Navigation
          </div>
          {commands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{cmd.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
