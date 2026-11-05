import { MessageSquare, Mic, AlertCircle, Play } from 'lucide-react';
import { LanguageMetrics } from '../types';

interface LiveSpeechBarProps {
  isActive: boolean;
  languageMetrics: LanguageMetrics;
  onSimulateWord: (word: string) => void;
  onStartMonitoring: () => void;
}

export function LiveSpeechBar({
  isActive,
  languageMetrics,
  onSimulateWord,
  onStartMonitoring,
}: LiveSpeechBarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
              isActive
                ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 ring-2 ring-red-500/20'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
            }`}
          >
            {isActive ? (
              <Mic className="h-4 w-4 animate-pulse text-red-600 dark:text-red-400" />
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Live Speech Recognition
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span
                className={`text-[11px] font-semibold ${
                  isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                }`}
              >
                {isActive ? 'Listening & Transcribing' : 'Standby (Turn On Guardian)'}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs truncate">
              {isActive ? (
                languageMetrics.lastSpokenTranscript ? (
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    Heard:{' '}
                    <strong className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded">
                      "{languageMetrics.lastSpokenTranscript}"
                    </strong>
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 italic">
                    Say "bitch", "damn", or any phrase to test...
                  </span>
                )
              ) : (
                <span className="text-slate-400 dark:text-slate-500">
                  Microphone is in standby. Click "Turn On Live Guardian" to listen.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Test Word Pills */}
        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium hidden md:inline">
            Quick Test:
          </span>
          <button
            type="button"
            onClick={() => onSimulateWord('bitch')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-950/70 dark:hover:bg-red-900/80 text-red-700 dark:text-red-300 transition-colors"
          >
            <Play className="h-3 w-3" />
            <span>Say "bitch"</span>
          </button>
          <button
            type="button"
            onClick={() => onSimulateWord('damn')}
            className="px-2 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            "damn"
          </button>
          {!isActive && (
            <button
              type="button"
              onClick={onStartMonitoring}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Mic className="h-3 w-3" />
              <span>Turn On</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
