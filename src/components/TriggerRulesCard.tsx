import { useState } from 'react';
import { Volume2, Smile, ShieldAlert, ToggleLeft, ToggleRight, Plus, X } from 'lucide-react';
import { TriggerRule } from '../types';
import { DEFAULT_PROFANITY_LIST } from '../utils/profanityDetector';

interface TriggerRulesCardProps {
  rules: TriggerRule[];
  onUpdateRule: (id: string, partial: Partial<TriggerRule>) => void;
}

export function TriggerRulesCard({ rules, onUpdateRule }: TriggerRulesCardProps) {
  const [newCustomWord, setNewCustomWord] = useState('');
  const speechRule = rules.find((r) => r.type === 'loud_speech');
  const laughterRule = rules.find((r) => r.type === 'loud_laughter');
  const profanityRule = rules.find((r) => r.type === 'profanity_check');

  const handleAddBannedWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomWord.trim() || !profanityRule) return;
    const currentList = profanityRule.bannedWords || [];
    const normalized = newCustomWord.trim().toLowerCase();
    if (!currentList.includes(normalized)) {
      onUpdateRule(profanityRule.id, {
        bannedWords: [...currentList, normalized],
      });
    }
    setNewCustomWord('');
  };

  const handleRemoveBannedWord = (wordToRemove: string) => {
    if (!profanityRule) return;
    const currentList = profanityRule.bannedWords || [];
    onUpdateRule(profanityRule.id, {
      bannedWords: currentList.filter((w) => w !== wordToRemove),
    });
  };

  return (
    <div id="rules" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Embarrassment Prevention Triggers
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">·</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              Acoustic & Language Rules
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure how loud your voice or laughter can get, and set profanity alerts to keep your language composed.
          </p>
        </div>
      </div>

      <div className="space-y-6 mt-6">
        {/* Rule 1: Loud Speech */}
        {speechRule && (
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                  <Volume2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    1. Loud Voice Intervention
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Triggers when your voice volume exceeds the selected decibel limit.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onUpdateRule(speechRule.id, { enabled: !speechRule.enabled })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {speechRule.enabled ? (
                  <ToggleRight className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ToggleLeft className="h-6 w-6" />
                )}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              {/* Threshold Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label htmlFor="speech-threshold" className="font-medium text-slate-700 dark:text-slate-300">
                    Loudness Threshold (dB)
                  </label>
                  <span className="font-mono font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                    {speechRule.threshold} dB
                  </span>
                </div>
                <input
                  id="speech-threshold"
                  type="range"
                  min="50"
                  max="95"
                  step="1"
                  value={speechRule.threshold}
                  onChange={(e) => onUpdateRule(speechRule.id, { threshold: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>50 dB (Whisper)</span>
                  <span>72 dB (Normal loud)</span>
                  <span>95 dB (Shout)</span>
                </div>
              </div>

              {/* Spoken Alert Phrase */}
              <div>
                <label htmlFor="speech-phrase" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  App Shouts Aloud
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="speech-phrase"
                    type="text"
                    value={speechRule.phrase}
                    onChange={(e) => onUpdateRule(speechRule.id, { phrase: e.target.value })}
                    placeholder="That's not nice!"
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium"
                  />
                  <select
                    value={speechRule.shoutStyle}
                    onChange={(e) =>
                      onUpdateRule(speechRule.id, {
                        shoutStyle: e.target.value as TriggerRule['shoutStyle'],
                      })
                    }
                    className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-800 dark:text-slate-200 shrink-0"
                  >
                    <option value="emphatic">Emphatic Shout</option>
                    <option value="firm">Firm Tone</option>
                    <option value="gentle">Polite</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rule 2: Loud Laughter */}
        {laughterRule && (
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <Smile className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    2. Overexcited Laughter Guard
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Detects rapid staccato bursts & high-pitch harmonic laughter spikes.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onUpdateRule(laughterRule.id, { enabled: !laughterRule.enabled })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {laughterRule.enabled ? (
                  <ToggleRight className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ToggleLeft className="h-6 w-6" />
                )}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              {/* Laughter Sensitivity */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label htmlFor="laughter-sensitivity" className="font-medium text-slate-700 dark:text-slate-300">
                    Detection Sensitivity
                  </label>
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                    {laughterRule.threshold}%
                  </span>
                </div>
                <input
                  id="laughter-sensitivity"
                  type="range"
                  min="20"
                  max="90"
                  step="5"
                  value={laughterRule.threshold}
                  onChange={(e) => onUpdateRule(laughterRule.id, { threshold: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>20% (Only roaring laughs)</span>
                  <span>55% (Balanced)</span>
                  <span>90% (Giggles included)</span>
                </div>
              </div>

              {/* Laughter Phrase */}
              <div>
                <label htmlFor="laughter-phrase" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  App Reminds You
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="laughter-phrase"
                    type="text"
                    value={laughterRule.phrase}
                    onChange={(e) => onUpdateRule(laughterRule.id, { phrase: e.target.value })}
                    placeholder="You are losing control."
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                  />
                  <select
                    value={laughterRule.shoutStyle}
                    onChange={(e) =>
                      onUpdateRule(laughterRule.id, {
                        shoutStyle: e.target.value as TriggerRule['shoutStyle'],
                      })
                    }
                    className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-800 dark:text-slate-200 shrink-0"
                  >
                    <option value="firm">Firm Reminder</option>
                    <option value="gentle">Gentle Whisper</option>
                    <option value="emphatic">Emphatic</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rule 3: Profanity Check */}
        {profanityRule && (
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    3. Profanity & Inappropriate Language Check
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Transcribes spoken speech in real-time and shouts "Language!" when profanities are detected.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onUpdateRule(profanityRule.id, { enabled: !profanityRule.enabled })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {profanityRule.enabled ? (
                  <ToggleRight className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ToggleLeft className="h-6 w-6" />
                )}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              {/* Spoken Alert Phrase */}
              <div>
                <label htmlFor="profanity-phrase" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  App Shouts Aloud
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="profanity-phrase"
                    type="text"
                    value={profanityRule.phrase}
                    onChange={(e) => onUpdateRule(profanityRule.id, { phrase: e.target.value })}
                    placeholder="Language!"
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-bold"
                  />
                  <select
                    value={profanityRule.shoutStyle}
                    onChange={(e) =>
                      onUpdateRule(profanityRule.id, {
                        shoutStyle: e.target.value as TriggerRule['shoutStyle'],
                      })
                    }
                    className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-800 dark:text-slate-200 shrink-0"
                  >
                    <option value="emphatic">Emphatic Shout</option>
                    <option value="firm">Firm</option>
                    <option value="gentle">Polite</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default: <strong className="text-red-500 font-semibold">"Language!"</strong> with instant voice & haptic pulse.
                </p>
              </div>

              {/* Banned Words Configuration */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Language Dictionary ({DEFAULT_PROFANITY_LIST.length} built-in vulgarities)
                </label>
                <form onSubmit={handleAddBannedWord} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCustomWord}
                    onChange={(e) => setNewCustomWord(e.target.value)}
                    placeholder="Add custom forbidden word..."
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shrink-0 hover:opacity-90"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </form>

                {/* Custom Words chips */}
                {profanityRule.bannedWords && profanityRule.bannedWords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {profanityRule.bannedWords.map((word) => (
                      <span
                        key={word}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-[11px]"
                      >
                        {word}
                        <button
                          type="button"
                          onClick={() => handleRemoveBannedWord(word)}
                          className="hover:text-red-900 dark:hover:text-red-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
