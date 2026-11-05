import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertMode, IncidentRecord, TriggerRule, LanguageMetrics } from '../types';
import { AudioComposureAnalyzer, AudioAnalysisResult } from '../utils/audioAnalyzer';
import { MotionComposureAnalyzer, MotionAnalysisResult } from '../utils/motionAnalyzer';
import { ContinuousSpeechLanguageGuardian, checkTextForProfanity } from '../utils/profanityDetector';
import { speakAlert, stopSpeaking, isAppCurrentlySpeaking } from '../utils/speechEngine';
import { triggerHapticVibration } from '../utils/haptics';
import { DEFAULT_RULES, ENVIRONMENT_PRESETS } from '../utils/presets';

export interface ActiveAlert {
  id: string;
  type: TriggerRule['type'];
  phrase: string;
  timestamp: number;
  intensity: string;
}

export function useComposureMonitor() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean>(false);
  const [motionSensorActive, setMotionSensorActive] = useState<boolean>(false);
  const [speechRecSupported, setSpeechRecSupported] = useState<boolean>(false);

  const [rules, setRules] = useState<TriggerRule[]>(() => {
    try {
      const saved = localStorage.getItem('auracheck_rules');
      if (saved) {
        const parsed: TriggerRule[] = JSON.parse(saved);
        const hasProfanity = parsed.some((r) => r.type === 'profanity_check');
        if (!hasProfanity) {
          return DEFAULT_RULES;
        }
        return parsed;
      }
    } catch {}
    return DEFAULT_RULES;
  });

  const [activePresetId, setActivePresetId] = useState<string>('preset_dinner');
  const [alertMode, setAlertMode] = useState<AlertMode>('accountability');
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  // Real-time metrics
  const [audioMetrics, setAudioMetrics] = useState<AudioAnalysisResult>({
    decibels: 24,
    peakDecibels: 24,
    volumeNormalized: 0,
    isLoudSpeech: false,
    isLaughter: false,
    laughterConfidence: 0,
    frequencies: new Uint8Array(64),
  });

  const [motionMetrics, setMotionMetrics] = useState<MotionAnalysisResult>({
    linearAcceleration: 0,
    motionScore: 0,
    isAttentionDrawing: false,
    source: 'idle',
  });

  const [languageMetrics, setLanguageMetrics] = useState<LanguageMetrics>({
    lastSpokenTranscript: '',
    profanityCount: 0,
    lastFlaggedWord: null,
    isSpeechRecognitionActive: false,
  });

  const [composureScore, setComposureScore] = useState<number>(100);
  const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>(null);
  const [incidentHistory, setIncidentHistory] = useState<IncidentRecord[]>([]);

  // Refs
  const rulesRef = useRef<TriggerRule[]>(rules);
  rulesRef.current = rules;

  const cooldownsRef = useRef<{ [ruleId: string]: number }>({});
  const recentIncidentTimesRef = useRef<number[]>([]);
  const audioAnalyzerRef = useRef<AudioComposureAnalyzer | null>(null);
  const motionAnalyzerRef = useRef<MotionComposureAnalyzer | null>(null);
  const languageGuardianRef = useRef<ContinuousSpeechLanguageGuardian | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sustainedLoudFramesRef = useRef<number>(0);

  // Save rules to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('auracheck_rules', JSON.stringify(rules));
    } catch {}
  }, [rules]);

  // Check speech recognition support on mount
  useEffect(() => {
    if (!languageGuardianRef.current) {
      languageGuardianRef.current = new ContinuousSpeechLanguageGuardian();
    }
    setSpeechRecSupported(languageGuardianRef.current.isSupported());
  }, []);

  // Dispatch incident helper
  const triggerIncident = useCallback(
    (
      rule: TriggerRule,
      measuredValue: string,
      actionTaken: string,
      scorePenalty = 15
    ) => {
      // 1. If the app is already shouting/speaking, ignore to prevent feedback loops
      if (isAppCurrentlySpeaking()) {
        return;
      }

      // 2. Circuit breaker against rapid runaway triggers
      const now = Date.now();
      recentIncidentTimesRef.current = recentIncidentTimesRef.current.filter((t) => now - t < 4000);
      if (recentIncidentTimesRef.current.length >= 3) {
        // Drop excess triggers to preserve browser responsiveness
        return;
      }
      recentIncidentTimesRef.current.push(now);

      const alertItem: ActiveAlert = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: rule.type,
        phrase: rule.phrase,
        timestamp: Date.now(),
        intensity: measuredValue,
      };

      setActiveAlert(alertItem);

      // Update Composure Score
      setComposureScore((prev) => Math.max(10, prev - scorePenalty));

      // Append to incident records
      setIncidentHistory((prev) => [
        {
          id: alertItem.id,
          timestamp: Date.now(),
          type: rule.type,
          label: rule.name,
          measuredValue,
          actionTaken,
          composureAtTime: Math.max(10, composureScore - scorePenalty),
        },
        ...prev.slice(0, 49),
      ]);

      // Perform Actions:
      // 1. Shouting / Speech Alert
      speakAlert({
        text: rule.phrase,
        style: rule.shoutStyle,
        mode: alertMode,
        voiceURI: selectedVoiceURI,
      });

      // 2. Gentle Haptic Vibration
      if (rule.vibratePattern && rule.vibratePattern.length > 0) {
        triggerHapticVibration(rule.vibratePattern, true);
      }
    },
    [alertMode, composureScore, selectedVoiceURI]
  );

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    // 1. Initialize Audio Analyzer
    if (!audioAnalyzerRef.current) {
      audioAnalyzerRef.current = new AudioComposureAnalyzer();
    }
    const audioOk = await audioAnalyzerRef.current.start();
    setMicPermissionGranted(audioOk);

    // 2. Initialize Motion Analyzer
    if (!motionAnalyzerRef.current) {
      motionAnalyzerRef.current = new MotionComposureAnalyzer();
    }
    const motionOk = await motionAnalyzerRef.current.requestPermissionAndStart();
    setMotionSensorActive(motionOk);

    // 3. Initialize Profanity & Language Guardian
    if (!languageGuardianRef.current) {
      languageGuardianRef.current = new ContinuousSpeechLanguageGuardian();
    }

    const profanityRule = rulesRef.current.find((r) => r.type === 'profanity_check');
    if (profanityRule?.bannedWords) {
      languageGuardianRef.current.setCustomWords(profanityRule.bannedWords);
    }

    const speechOk = languageGuardianRef.current.start(
      (detectedWord, fullSentence) => {
        // Echo cancellation: ignore if app itself is speaking
        if (isAppCurrentlySpeaking()) return;

        const rule =
          rulesRef.current.find((r) => r.type === 'profanity_check' && r.enabled !== false) ||
          DEFAULT_RULES[2];
        if (!rule) return;

        const now = Date.now();
        const lastFired = cooldownsRef.current[rule.id] || 0;
        if (now - lastFired > 1800) {
          cooldownsRef.current[rule.id] = now;
          setLanguageMetrics((prev) => ({
            ...prev,
            profanityCount: prev.profanityCount + 1,
            lastFlaggedWord: detectedWord,
            lastSpokenTranscript: fullSentence,
          }));
          triggerIncident(
            rule,
            `Inappropriate Word: "${detectedWord}"`,
            `Shouted: "${rule.phrase}"`,
            20
          );
        }
      },
      (transcript) => {
        if (!isAppCurrentlySpeaking()) {
          setLanguageMetrics((prev) => ({
            ...prev,
            lastSpokenTranscript: transcript,
          }));
        }
      }
    );

    setLanguageMetrics((prev) => ({
      ...prev,
      isSpeechRecognitionActive: speechOk,
    }));

    setIsActive(true);
  }, [triggerIncident]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsActive(false);
    stopSpeaking();
    if (audioAnalyzerRef.current) {
      audioAnalyzerRef.current.stop();
    }
    if (motionAnalyzerRef.current) {
      motionAnalyzerRef.current.stop();
    }
    if (languageGuardianRef.current) {
      languageGuardianRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioMetrics((prev) => ({
      ...prev,
      decibels: 24,
      volumeNormalized: 0,
      isLoudSpeech: false,
      isLaughter: false,
    }));
    setLanguageMetrics((prev) => ({
      ...prev,
      isSpeechRecognitionActive: false,
    }));
  }, []);

  // Rule update helpers
  const updateRule = useCallback((ruleId: string, partial: Partial<TriggerRule>) => {
    setRules((prev) => {
      const updated = prev.map((r) => (r.id === ruleId ? { ...r, ...partial } : r));
      const profRule = updated.find((r) => r.type === 'profanity_check');
      if (profRule?.bannedWords && languageGuardianRef.current) {
        languageGuardianRef.current.setCustomWords(profRule.bannedWords);
      }
      return updated;
    });
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const preset = ENVIRONMENT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(presetId);
    setAlertMode(preset.suggestedMode);

    setRules((prev) =>
      prev.map((r) => {
        if (r.type === 'loud_speech') return { ...r, threshold: preset.speechDbThreshold };
        if (r.type === 'loud_laughter') return { ...r, threshold: preset.laughterThreshold };
        if (r.type === 'profanity_check') return { ...r, threshold: preset.motionThreshold };
        return r;
      })
    );
  }, []);

  // Dismiss current alert
  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
    stopSpeaking();
  }, []);

  // Grounding / Reset composure
  const resetComposure = useCallback(() => {
    setActiveAlert(null);
    stopSpeaking();
    setComposureScore(100);
  }, []);

  // Clear incident logs
  const clearHistory = useCallback(() => {
    setIncidentHistory([]);
    setLanguageMetrics((prev) => ({
      ...prev,
      profanityCount: 0,
      lastFlaggedWord: null,
    }));
  }, []);

  // Manual simulation tools for immediate test satisfaction
  const simulateLoudSpeech = useCallback(
    (db = 86) => {
      const rule = rules.find((r) => r.type === 'loud_speech') || DEFAULT_RULES[0];
      triggerIncident(rule, `${db} dB (Loud Voice Burst)`, `Shouted: "${rule.phrase}"`, 18);
    },
    [rules, triggerIncident]
  );

  const simulateLoudLaughter = useCallback(() => {
    const rule = rules.find((r) => r.type === 'loud_laughter') || DEFAULT_RULES[1];
    triggerIncident(rule, 'Laughter Harmonics 88% (Loss of Composure)', `Reminded: "${rule.phrase}"`, 14);
  }, [rules, triggerIncident]);

  const simulateProfanity = useCallback(
    (testWord = 'damn') => {
      const rule = rules.find((r) => r.type === 'profanity_check') || DEFAULT_RULES[2];
      setLanguageMetrics((prev) => ({
        ...prev,
        profanityCount: prev.profanityCount + 1,
        lastFlaggedWord: testWord,
        lastSpokenTranscript: `...used inappropriate word: "${testWord}"`,
      }));
      triggerIncident(rule, `Inappropriate Language: "${testWord}"`, `Shouted: "${rule.phrase}"`, 20);
    },
    [rules, triggerIncident]
  );

  // Manual text profanity check
  const checkTextLanguage = useCallback(
    (input: string) => {
      const profRule = rules.find((r) => r.type === 'profanity_check') || DEFAULT_RULES[2];
      const match = checkTextForProfanity(input, profRule.bannedWords || []);
      if (match.found && match.matchedWord) {
        simulateProfanity(match.matchedWord);
        return true;
      }
      return false;
    },
    [rules, simulateProfanity]
  );

  // Main evaluation loop for audio & recovery
  useEffect(() => {
    if (!isActive) return;

    let isRunning = true;
    let lastComposureRecoveryTime = performance.now();

    const checkTriggers = () => {
      if (!isRunning) return;

      // CRITICAL: If the app is currently speaking (or in the post-speech echo window),
      // IGNORE audio levels so the microphone doesn't hear the speakers and enter a feedback freeze!
      if (isAppCurrentlySpeaking()) {
        sustainedLoudFramesRef.current = 0;
        animationFrameRef.current = requestAnimationFrame(checkTriggers);
        return;
      }

      const speechRule = rules.find((r) => r.type === 'loud_speech' && r.enabled);
      const laughterRule = rules.find((r) => r.type === 'loud_laughter' && r.enabled);

      // 1. Analyze Audio
      if (audioAnalyzerRef.current) {
        const audio = audioAnalyzerRef.current.analyze(
          speechRule ? speechRule.threshold : 72,
          laughterRule ? laughterRule.threshold : 60
        );
        setAudioMetrics(audio);

        const now = Date.now();

        // Check loud speech trigger
        if (speechRule) {
          if (audio.decibels >= speechRule.threshold) {
            sustainedLoudFramesRef.current += 1;
            if (sustainedLoudFramesRef.current >= 4) {
              const lastFired = cooldownsRef.current[speechRule.id] || 0;
              if (now - lastFired > speechRule.cooldownMs) {
                cooldownsRef.current[speechRule.id] = now;
                triggerIncident(
                  speechRule,
                  `${audio.decibels} dB (Exceeds ${speechRule.threshold} dB)`,
                  `Shouted: "${speechRule.phrase}"`,
                  16
                );
              }
            }
          } else {
            sustainedLoudFramesRef.current = Math.max(0, sustainedLoudFramesRef.current - 1);
          }
        }

        // Check loud laughter trigger
        if (laughterRule && audio.isLaughter) {
          const lastFired = cooldownsRef.current[laughterRule.id] || 0;
          if (now - lastFired > laughterRule.cooldownMs) {
            cooldownsRef.current[laughterRule.id] = now;
            triggerIncident(
              laughterRule,
              `Loud Laughter ${(audio.laughterConfidence * 100).toFixed(0)}% harmonic burst`,
              `Reminded: "${laughterRule.phrase}"`,
              14
            );
          }
        }
      }

      // 2. Composure Natural Recovery
      const perfNow = performance.now();
      if (perfNow - lastComposureRecoveryTime > 1500) {
        lastComposureRecoveryTime = perfNow;
        setComposureScore((prev) => (prev < 100 ? Math.min(100, prev + 2) : 100));
      }

      animationFrameRef.current = requestAnimationFrame(checkTriggers);
    };

    animationFrameRef.current = requestAnimationFrame(checkTriggers);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, rules, triggerIncident]);

  return {
    isActive,
    micPermissionGranted,
    motionSensorActive,
    speechRecSupported,
    rules,
    activePresetId,
    alertMode,
    selectedVoiceURI,
    audioMetrics,
    motionMetrics,
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
  };
}
