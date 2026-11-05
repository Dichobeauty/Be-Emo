import { useEffect } from 'react';
import { Volume2, Smile, ShieldAlert, Check } from 'lucide-react';
import { ActiveAlert } from '../hooks/useComposureMonitor';

interface ActiveAlertBannerProps {
  alert: ActiveAlert | null;
  onDismiss: () => void;
  onOpenBreathing: () => void;
}

export function ActiveAlertBanner({ alert, onDismiss, onOpenBreathing }: ActiveAlertBannerProps) {
  useEffect(() => {
    if (!alert) return;

    // Auto-dismiss after 3.8 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 3800);

    return () => clearTimeout(timer);
  }, [alert, onDismiss]);

  if (!alert) return null;

  const isLoudSpeech = alert.type === 'loud_speech';
  const isLaughter = alert.type === 'loud_laughter';
  const isProfanity = alert.type === 'profanity_check';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`pointer-events-auto rounded-2xl border p-4 shadow-xl backdrop-blur-md flex items-center justify-between gap-4 ${
          isProfanity
            ? 'bg-red-50/95 dark:bg-red-950/90 border-red-300 dark:border-red-800 text-red-900 dark:text-red-100 ring-2 ring-red-500/20'
            : isLoudSpeech
            ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
            : isLaughter
            ? 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
            : 'bg-indigo-50/95 dark:bg-indigo-950/90 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isProfanity
                ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                : isLoudSpeech
                ? 'bg-rose-500 text-white'
                : isLaughter
                ? 'bg-amber-500 text-white'
                : 'bg-indigo-500 text-white'
            }`}
          >
            {isProfanity ? (
              <ShieldAlert className="h-5 w-5" />
            ) : isLoudSpeech ? (
              <Volume2 className="h-5 w-5" />
            ) : isLaughter ? (
              <Smile className="h-5 w-5" />
            ) : (
              <ShieldAlert className="h-5 w-5" />
            )}
          </div>

          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase opacity-80 font-mono">
              {alert.intensity}
            </div>
            <div className="text-base font-extrabold tracking-tight">
              {alert.phrase}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenBreathing}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white/70 hover:bg-white dark:bg-slate-900/70 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Breathe
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Acknowledge alert"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 text-slate-900 dark:text-white shadow-xs transition-colors cursor-pointer"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
