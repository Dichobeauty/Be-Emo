import { Mic, Smile, ShieldAlert, Wind, Sparkles, RefreshCw } from 'lucide-react';
import { AudioAnalysisResult } from '../utils/audioAnalyzer';
import { LanguageMetrics } from '../types';

interface ComposureMeterProps {
  score: number;
  audioMetrics: AudioAnalysisResult;
  languageMetrics: LanguageMetrics;
  isActive: boolean;
  onResetComposure: () => void;
  onOpenBreathing: () => void;
}

export function ComposureMeter({
  score,
  audioMetrics,
  languageMetrics,
  isActive,
  onResetComposure,
  onOpenBreathing,
}: ComposureMeterProps) {
  // SVG circular gauge math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = '#10b981'; // emerald-500
  let stateTitle = 'Poised & Composed';
  let stateSubtitle = 'Normal vocal level and respectful language maintained';

  if (score < 60) {
    scoreColor = '#f43f5e'; // rose-500
    stateTitle = 'Loss of Composure Alert';
    stateSubtitle = 'Recent vocal outburst, loud laughter, or profanity detected';
  } else if (score < 85) {
    scoreColor = '#f59e0b'; // amber-500
    stateTitle = 'Heightened Intensity';
    stateSubtitle = 'Volume or excited laughter climbing';
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        {/* Left: Radial Circular Gauge */}
        <div className="flex items-center gap-6">
          <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Progress ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={scoreColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
                {score}
              </span>
              <span className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
                Composure
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Emotional Composure
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
              {stateTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {stateSubtitle}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={onResetComposure}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset to 100</span>
              </button>
              <button
                type="button"
                onClick={onOpenBreathing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
              >
                <Wind className="h-3.5 w-3.5" />
                <span>Calm Breath</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Guidance Callout */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-800 md:max-w-xs w-full">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Active Guardian Rules</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Keeps vocal loudness below limits, flags loss-of-control laughter, and shouts <strong className="text-red-500 font-semibold">"Language!"</strong> the moment inappropriate language is detected.
          </p>
        </div>
      </div>

      {/* 3 Real-time Indicator Strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        {/* Metric 1: Vocal Loudness */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Mic className="h-4 w-4 text-indigo-500" />
              <span>Voice Loudness</span>
            </span>
            <span className="font-mono tabular-nums text-slate-700 dark:text-slate-200 font-semibold">
              {isActive ? `${audioMetrics.decibels} dB` : 'Standby'}
            </span>
          </div>
          <div className="mt-2.5 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                audioMetrics.isLoudSpeech
                  ? 'bg-rose-500'
                  : audioMetrics.decibels > 65
                  ? 'bg-amber-500'
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(8, (audioMetrics.decibels / 100) * 100))}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            <span>Peak: {isActive ? `${audioMetrics.peakDecibels} dB` : '--'}</span>
            <span>{audioMetrics.isLoudSpeech ? 'Too Loud' : 'Normal Volume'}</span>
          </div>
        </div>

        {/* Metric 2: Laughter Harmonics */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Smile className="h-4 w-4 text-amber-500" />
              <span>Laughter Intensity</span>
            </span>
            <span className="font-mono tabular-nums text-slate-700 dark:text-slate-200 font-semibold">
              {isActive ? `${Math.round(audioMetrics.laughterConfidence * 100)}%` : 'Standby'}
            </span>
          </div>
          <div className="mt-2.5 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                audioMetrics.isLaughter ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.max(6, audioMetrics.laughterConfidence * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            <span>Harmonic Bursts</span>
            <span>{audioMetrics.isLaughter ? 'Losing Control' : 'Normal Demeanor'}</span>
          </div>
        </div>

        {/* Metric 3: Profanity & Inappropriate Language */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              <span>Profanity Check</span>
            </span>
            <span className="font-mono tabular-nums text-slate-700 dark:text-slate-200 font-semibold">
              {languageMetrics.profanityCount > 0
                ? `${languageMetrics.profanityCount} Flagged`
                : isActive
                ? 'Clean'
                : 'Standby'}
            </span>
          </div>
          <div className="mt-2.5 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                languageMetrics.profanityCount > 0 ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${languageMetrics.profanityCount > 0 ? 100 : 100}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            <span>
              {languageMetrics.lastFlaggedWord
                ? `Flagged: "${languageMetrics.lastFlaggedWord}"`
                : 'Zero Profanity'}
            </span>
            <span>{isActive ? 'Speech Rec Active' : 'Standby'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
