import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { SettingsView } from './components/Settings';
import { SavedContent } from './components/SavedContent';
import { CommandPalette } from './components/CommandPalette';

export type View = 'studio' | 'saved' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('studio');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
      // Simple view switching shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        setCurrentView('studio');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        setCurrentView('saved');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '3') {
        e.preventDefault();
        setCurrentView('settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0f172a] text-slate-200 font-sans antialiased overflow-hidden selection:bg-indigo-500/30">
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative order-1 md:order-2 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
          {currentView === 'studio' && <Dashboard />}
          {currentView === 'saved' && <SavedContent />}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>
      
      <div className="order-2 md:order-1 shrink-0 z-50 fixed bottom-0 left-0 right-0 md:relative md:w-auto md:h-full">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {isCommandPaletteOpen && (
        <CommandPalette 
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigate={(view) => {
            setCurrentView(view as View);
            setIsCommandPaletteOpen(false);
          }}
        />
      )}
    </div>
  );
}
