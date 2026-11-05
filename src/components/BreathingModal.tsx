import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function BreathingModal({ isOpen, onClose, onComplete }: BreathingModalProps) {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [countdown, setCountdown] = useState<number>(4);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setPhase('Inhale');
      setCountdown(4);
      setCyclesCompleted(0);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Advance phase
          setPhase((currentPhase) => {
            if (currentPhase === 'Inhale') return 'Hold';
            if (currentPhase === 'Hold') return 'Exhale';
            if (currentPhase === 'Exhale') {
              setCyclesCompleted((c) => c + 1);
              return 'Inhale';
            }
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Social Composure Grounding
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Take a moment to lower vocal tension and regain steady self-control.
        </p>

        {/* Breathing Animation Circle */}
        <div className="my-8 flex items-center justify-center">
          <div className="relative flex h-48 w-48 items-center justify-center">
            {/* Pulsing ring */}
            <div
              className={`absolute inset-0 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 transition-transform duration-1000 ease-in-out ${
                phase === 'Inhale'
                  ? 'scale-110'
                  : phase === 'Hold'
                  ? 'scale-110'
                  : 'scale-75'
              }`}
            />
            <div
              className={`flex h-36 w-36 items-center justify-center rounded-full border-2 border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/40 text-center transition-all duration-1000 ease-in-out ${
                phase === 'Inhale'
                  ? 'scale-105 shadow-lg shadow-indigo-500/10'
                  : phase === 'Hold'
                  ? 'scale-105'
                  : 'scale-90 shadow-none'
              }`}
            >
              <div>
                <div className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                  {phase}
                </div>
                <div className="mt-1 font-mono text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {countdown}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-mono">
          Cycles completed: <strong className="text-indigo-600 dark:text-indigo-400">{cyclesCompleted}</strong> / 3
        </div>

        <button
          type="button"
          onClick={() => {
            onComplete();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm shadow-indigo-600/20 active:scale-98"
        >
          <Check className="h-4 w-4" />
          <span>I Am Composed Now (Reset Score to 100)</span>
        </button>
      </div>
    </div>
  );
}
