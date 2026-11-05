import { useState } from 'react';
import { Volume2, Smile, ShieldAlert, Play, Check, Sparkles, MessageSquare } from 'lucide-react';
import { triggerHapticVibration, HAPTIC_PATTERNS } from '../utils/haptics';
import { getAvailableVoices } from '../utils/speechEngine';
import { AlertMode } from '../types';

interface TestStudioCardProps {
  onSimulateSpeech: (db?: number) => void;
  onSimulateLaughter: () => void;
  onSimulateProfanity: (word?: string) => void;
  onCheckCustomText?: (text: string) => boolean;
  speechPhrase: string;
  laughterPhrase: string;
  profanityPhrase: string;
  alertMode: AlertMode;
  selectedVoiceURI: string;
  onSelectVoice: (uri: string) => void;
  isSpeechRecSupported?: boolean;
}

export function TestStudioCard({
  onSimulateSpeech,
  onSimulateLaughter,
  onSimulateProfanity,
  onCheckCustomText,
  speechPhrase,
  laughterPhrase,
  profanityPhrase,
  selectedVoiceURI,
  onSelectVoice,
  isSpeechRecSupported = true,
}: TestStudioCardProps) {
  const [lastTested, setLastTested] = useState<string | null>(null);
  const [testInput, setTestInput] = useState<string>('');
  const voices = getAvailableVoices();

  const handleTestSpeech = () => {
    setLastTested('speech');
    onSimulateSpeech(88);
    setTimeout(() => setLastTested(null), 2500);
  };

  const handleTestLaughter = () => {
    setLastTested('laughter');
    onSimulateLaughter();
    setTimeout(() => setLastTested(null), 2500);
  };

  const handleTestProfanity = (word = 'damn') => {
    setLastTested('profanity');
    onSimulateProfanity(word);
    setTimeout(() => setLastTested(null), 2500);
  };

  const handleManualCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;
    if (onCheckCustomText) {
      onCheckCustomText(testInput);
    } else {
      onSimulateProfanity(testInput);
    }
    setTestInput('');
  };

  const handleDirectHapticTest = (patternName: keyof typeof HAPTIC_PATTERNS) => {
    triggerHapticVibration(HAPTIC_PATTERNS[patternName], true);
  };

  return (
    <div id="simulator" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Instant Behavior Test Studio
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">·</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              Simulation Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Test and calibrate each scenario immediately without having to make real noise or swear in public.
          </p>
        </div>

        {/* Voice Selection */}
        {voices.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="voice-select" className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Speaker Voice:
            </label>
            <select
              id="voice-select"
              value={selectedVoiceURI}
              onChange={(e) => onSelectVoice(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[200px] truncate"
            >
              <option value="">Default System Voice</option>
              {voices.slice(0, 14).map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3 Primary User Scenario Test Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {/* Test 1: Loud Voice */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <Volume2 className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-mono text-slate-400">Simulate 88 dB</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-3">
              Loud Speech Trigger
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Shouts aloud: <span className="font-semibold text-rose-600 dark:text-rose-400">"{speechPhrase}"</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestSpeech}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              lastTested === 'speech'
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white hover:bg-rose-700 active:scale-98 shadow-sm shadow-rose-600/20'
            }`}
          >
            {lastTested === 'speech' ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Triggered Shouting!</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Test Loud Voice Alert</span>
              </>
            )}
          </button>
        </div>

        {/* Test 2: Loud Laughter */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Smile className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-mono text-slate-400">Harmonics 88%</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-3">
              Loud Laughter Trigger
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Reminds you: <span className="font-semibold text-amber-600 dark:text-amber-400">"{laughterPhrase}"</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestLaughter}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              lastTested === 'laughter'
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-98 shadow-sm shadow-amber-600/20'
            }`}
          >
            {lastTested === 'laughter' ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Reminded Aloud!</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Test Laughter Reminder</span>
              </>
            )}
          </button>
        </div>

        {/* Test 3: Profanity Check */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-mono text-slate-400">Language Filter</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-3">
              Profanity Check Trigger
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Shouts aloud: <span className="font-bold text-red-600 dark:text-red-400">"{profanityPhrase}"</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleTestProfanity('damn')}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              lastTested === 'profanity'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white hover:bg-red-700 active:scale-98 shadow-sm shadow-red-600/20'
            }`}
          >
            {lastTested === 'profanity' ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Shouted "Language!"</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Test Profanity Alert</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Manual Word & Speech Sandbox */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleManualCheck} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <MessageSquare className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Type word to test (e.g. crap, damn)..."
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Check Word
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Tactile Haptics:</span>
          </span>
          <button
            type="button"
            onClick={() => handleDirectHapticTest('gentle_tap')}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
          >
            Gentle Tap
          </button>
          <button
            type="button"
            onClick={() => handleDirectHapticTest('alert_pulse')}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
          >
            Alert Pulse
          </button>
        </div>
      </div>
    </div>
  );
}
