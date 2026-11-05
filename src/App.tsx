import { useState, useEffect } from 'react';
import { useComposureMonitor } from './hooks/useComposureMonitor';
import { TopNav } from './components/TopNav';
import { ComposureMeter } from './components/ComposureMeter';
import { AudioVisualizer } from './components/AudioVisualizer';
import { TestStudioCard } from './components/TestStudioCard';
import { TriggerRulesCard } from './components/TriggerRulesCard';
import { EnvironmentPresets } from './components/EnvironmentPresets';
import { IncidentHistory } from './components/IncidentHistory';
import { BreathingModal } from './components/BreathingModal';
import { ActiveAlertBanner } from './components/ActiveAlertBanner';
import { LiveSpeechBar } from './components/LiveSpeechBar';
import { Shield, Mic, MessageSquare } from 'lucide-react';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('auracheck_theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    } catch {
      return false;
    }
  });

  const [isBreathingOpen, setIsBreathingOpen] = useState<boolean>(false);
  const [isHapticAnimating, setIsHapticAnimating] = useState<boolean>(false);

  const {
    isActive,
    micPermissionGranted,
    speechRecSupported,
    rules,
    activePresetId,
    alertMode,
    selectedVoiceURI,
    audioMetrics,
    languageMetrics,
    composureScore,
    activeAlert,
    incidentHistory,
    startMonitoring,
    stopMonitoring,
    updateRule,
    applyPreset,
    setAlertMode,
    setSelectedVoiceURI,
    dismissAlert,
    resetComposure,
    clearHistory,
    simulateLoudSpeech,
    simulateLoudLaughter,
    simulateProfanity,
    checkTextLanguage,
  } = useComposureMonitor();

  // Sync dark class on document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('auracheck_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('auracheck_theme', 'light');
    }
  }, [isDark]);

  // Listen for custom haptic vibration events to shake the UI container
  useEffect(() => {
    const handleHaptic = () => {
      setIsHapticAnimating(true);
      setTimeout(() => setIsHapticAnimating(false), 450);
    };

    window.addEventListener('auracheck:haptic', handleHaptic);
    return () => window.removeEventListener('auracheck:haptic', handleHaptic);
  }, []);

  const speechRule = rules.find((r) => r.type === 'loud_speech');
  const laughterRule = rules.find((r) => r.type === 'loud_laughter');
  const profanityRule = rules.find((r) => r.type === 'profanity_check');

  return (
    <div
      className={`min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200 ${
        isHapticAnimating ? 'animate-haptic ring-2 ring-indigo-500/40' : ''
      }`}
    >
      {/* Top Bar Navigation */}
      <TopNav
        isActive={isActive}
        onToggleActive={() => (isActive ? stopMonitoring() : startMonitoring())}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
        alertMode={alertMode}
        onChangeMode={setAlertMode}
        onOpenBreathing={() => setIsBreathingOpen(true)}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 p-6 sm:p-8 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Shield className="h-4 w-4" />
                <span>Personal Social Decorum Guardian</span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ textWrap: 'balance' }}>
                Monitors volume, laughter, and profanity to avoid social embarrassment.
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Speaks up when you speak loud, cautions you if you laugh uncontrollably, and immediately shouts <strong className="text-red-500 dark:text-red-400 font-semibold">"Language!"</strong> with a gentle haptic vibration whenever inappropriate language is spoken.
              </p>

              {/* Status metadata */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Mic className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Acoustics: {isActive ? (micPermissionGranted ? 'Active' : 'Awaiting Permission') : 'Standby'}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MessageSquare className="h-3.5 w-3.5 text-red-500" />
                  <span>Speech Filter: {isActive ? (languageMetrics.isSpeechRecognitionActive ? 'Listening for Profanity' : 'Active') : (speechRecSupported ? 'Ready' : 'Text Ready')}</span>
                </span>
                <span>·</span>
                <span>Mode: <strong className="capitalize text-slate-700 dark:text-slate-300 font-semibold">{alertMode}</strong></span>
              </div>
            </div>

            {/* Quick Status Box */}
            <div className="shrink-0 flex flex-col items-start lg:items-end gap-3">
              <button
                type="button"
                onClick={() => (isActive ? stopMonitoring() : startMonitoring())}
                className={`px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all active:scale-98 ${
                  isActive
                    ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/25'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/25'
                }`}
              >
                {isActive ? 'Pause Guardian' : 'Turn On Live Guardian'}
              </button>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                100% on-device speech & acoustic analysis · Zero cloud audio streaming
              </div>
            </div>
          </div>
        </div>

        {/* Live Audio Visualizer Bar */}
        <AudioVisualizer
          frequencies={audioMetrics.frequencies}
          decibels={audioMetrics.decibels}
          thresholdDb={speechRule ? speechRule.threshold : 72}
          isActive={isActive}
          isLoud={audioMetrics.isLoudSpeech}
        />

        {/* Live Speech Recognition & Transcript Bar */}
        <LiveSpeechBar
          isActive={isActive}
          languageMetrics={languageMetrics}
          onSimulateWord={simulateProfanity}
          onStartMonitoring={startMonitoring}
        />

        {/* Central Live Composure Monitor */}
        <section id="monitor">
          <ComposureMeter
            score={composureScore}
            audioMetrics={audioMetrics}
            languageMetrics={languageMetrics}
            isActive={isActive}
            onResetComposure={resetComposure}
            onOpenBreathing={() => setIsBreathingOpen(true)}
          />
        </section>

        {/* Interactive Instant Test Studio */}
        <TestStudioCard
          onSimulateSpeech={simulateLoudSpeech}
          onSimulateLaughter={simulateLoudLaughter}
          onSimulateProfanity={simulateProfanity}
          onCheckCustomText={checkTextLanguage}
          speechPhrase={speechRule ? speechRule.phrase : "That's not nice!"}
          laughterPhrase={laughterRule ? laughterRule.phrase : 'You are losing control.'}
          profanityPhrase={profanityRule ? profanityRule.phrase : 'Language!'}
          alertMode={alertMode}
          selectedVoiceURI={selectedVoiceURI}
          onSelectVoice={setSelectedVoiceURI}
          isSpeechRecSupported={speechRecSupported}
        />

        {/* Social Environment Acoustic Presets */}
        <EnvironmentPresets
          activePresetId={activePresetId}
          onSelectPreset={applyPreset}
        />

        {/* Trigger Rules Configuration */}
        <TriggerRulesCard rules={rules} onUpdateRule={updateRule} />

        {/* Incident History & Intervention Timeline */}
        <IncidentHistory incidents={incidentHistory} onClear={clearHistory} />
      </main>

      {/* Grounding Box Breathing Modal */}
      <BreathingModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
        onComplete={resetComposure}
      />

      {/* Active Alert Banner */}
      <ActiveAlertBanner
        alert={activeAlert}
        onDismiss={dismissAlert}
        onOpenBreathing={() => {
          dismissAlert();
          setIsBreathingOpen(true);
        }}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200/80 dark:border-slate-800/80 py-8 bg-white/50 dark:bg-slate-950/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            AuraCheck · Behavioral and Acoustic Decorum Engine
          </div>
          <div className="flex items-center gap-4">
            <span>Client-side Web Speech & Web Audio API</span>
            <span>·</span>
            <span>Local privacy guaranteed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
