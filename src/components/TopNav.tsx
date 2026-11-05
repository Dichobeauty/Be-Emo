import { Shield, ShieldAlert, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { AlertMode } from '../types';

interface TopNavProps {
  isActive: boolean;
  onToggleActive: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  alertMode: AlertMode;
  onChangeMode: (mode: AlertMode) => void;
  onOpenBreathing: () => void;
}

export function TopNav({
  isActive,
  onToggleActive,
  isDark,
  onToggleTheme,
  alertMode,
  onChangeMode,
  onOpenBreathing,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
            {isActive ? <Shield className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5 text-indigo-200" />}
          </div>
          <a href="#" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            AuraCheck
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a href="#monitor" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
            Live Monitor
          </a>
          <a href="#rules" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
            Trigger Rules
          </a>
          <a href="#simulator" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
            Test Studio
          </a>
          <a href="#timeline" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
            Incident Log
          </a>
          <button
            type="button"
            onClick={onOpenBreathing}
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap text-left"
          >
            Grounding Breath
          </button>
        </nav>

        {/* Zone 3: Mode controls & Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mode Switcher */}
          <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => onChangeMode('accountability')}
              title="Shouts/speaks reminders aloud to hold you accountable"
              className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                alertMode === 'accountability'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Accountable
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('whisper')}
              title="Discreet gentle whispers for quiet environments"
              className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                alertMode === 'whisper'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Whisper
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('haptic_only')}
              title="Vibration pulses only, zero spoken sound"
              className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                alertMode === 'haptic_only'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Haptic
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle visual theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onToggleActive}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-sm whitespace-nowrap ${
              isActive
                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20 active:scale-95'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20 active:scale-95'
            }`}
          >
            {isActive ? (
              <>
                <VolumeX className="h-4 w-4" />
                <span>Pause Guard</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                <span>Start Monitoring</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
