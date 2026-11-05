import { useState } from 'react';
import { IncidentRecord, AlertType } from '../types';
import { Volume2, Smile, ShieldAlert, Trash2, Clock, ShieldCheck } from 'lucide-react';

interface IncidentHistoryProps {
  incidents: IncidentRecord[];
  onClear: () => void;
}

export function IncidentHistory({ incidents, onClear }: IncidentHistoryProps) {
  const [filter, setFilter] = useState<string>('all');

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === 'all') return true;
    return inc.type === filter;
  });

  const getIncidentIcon = (type: AlertType) => {
    switch (type) {
      case 'loud_speech':
        return <Volume2 className="h-4 w-4 text-rose-500" />;
      case 'loud_laughter':
        return <Smile className="h-4 w-4 text-amber-500" />;
      case 'profanity_check':
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      default:
        return <Volume2 className="h-4 w-4 text-slate-500" />;
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div id="timeline" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Composure Incident Timeline
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {incidents.length} interventions recorded
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time audit log of prevented embarrassments, noise flags, and language corrections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Segmented Control */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('loud_speech')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'loud_speech'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Voice
            </button>
            <button
              type="button"
              onClick={() => setFilter('loud_laughter')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'loud_laughter'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Laughter
            </button>
            <button
              type="button"
              onClick={() => setFilter('profanity_check')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'profanity_check'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Profanity
            </button>
          </div>

          {incidents.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {filteredIncidents.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Flawless Demeanor
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            No voice spikes, loud laughter bursts, or profane language detected. Try triggering a simulation above to test.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
          {filteredIncidents.map((incident) => (
            <div key={incident.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  {getIncidentIcon(incident.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {incident.label}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      {incident.actionTaken}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="font-mono">{incident.measuredValue}</span>
                    <span>·</span>
                    <span className="font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(incident.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                  {incident.composureAtTime}%
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Composure
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
