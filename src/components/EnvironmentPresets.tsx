import { ENVIRONMENT_PRESETS } from '../utils/presets';
import { Coffee, Library, Briefcase, PartyPopper } from 'lucide-react';

interface EnvironmentPresetsProps {
  activePresetId: string;
  onSelectPreset: (id: string) => void;
}

export function EnvironmentPresets({ activePresetId, onSelectPreset }: EnvironmentPresetsProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case 'preset_library':
        return <Library className="h-4 w-4" />;
      case 'preset_dinner':
        return <Coffee className="h-4 w-4" />;
      case 'preset_office':
        return <Briefcase className="h-4 w-4" />;
      case 'preset_party':
        return <PartyPopper className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Social Environment Calibration
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Pre-tuned for room acoustics
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ENVIRONMENT_PRESETS.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-500 shadow-xs ring-1 ring-indigo-600/20'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-950/30'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {getIcon(preset.id)}
                </span>
                <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {preset.speechDbThreshold} dB
                </span>
              </div>

              <div className="mt-2.5 font-semibold text-xs text-slate-900 dark:text-white">
                {preset.name}
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
