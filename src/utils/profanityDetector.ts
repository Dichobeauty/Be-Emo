/**
 * Profanity and inappropriate language detection engine using continuous Web Speech Recognition.
 *
 * NOTE: Google Chrome's Web Speech API (webkitSpeechRecognition) automatically censors
 * profanities with asterisks (e.g. "bitch" -> "b***h" or "b****" or "****", "fuck" -> "f***").
 * This module detects both raw words, browser-censored asterisks, and phonetic variations.
 */

import { isAppCurrentlySpeaking } from './speechEngine';

// Common raw profane words
export const DEFAULT_PROFANITY_LIST = [
  'bitch',
  'bitches',
  'bitching',
  'fuck',
  'fucking',
  'fucked',
  'fucker',
  'shit',
  'shitting',
  'bullshit',
  'asshole',
  'bastard',
  'damn',
  'dammit',
  'dick',
  'cunt',
  'pussy',
  'motherfucker',
  'crap',
  'piss',
  'slut',
  'whore',
  'cock',
  'douche',
  'douchebag',
  'twat',
  'prick',
  'wanker',
  'bollocks',
];

// Patterns for Chrome / browser auto-censored speech output
const CENSORED_PATTERNS = [
  { pattern: /\bb[\*]+[a-z]*\b/i, label: 'bitch' },          // b***h, b****, b***
  { pattern: /\bf[\*]+[a-z]*\b/i, label: 'fuck' },           // f***, f***ing, f****
  { pattern: /\bs[\*]+[a-z]*\b/i, label: 'shit' },           // s***, s****, s**t
  { pattern: /\ba[\*]+(hole|[a-z]*)\b/i, label: 'asshole' }, // a**hole, a*****, a**
  { pattern: /\bc[\*]+[a-z]*\b/i, label: 'cunt' },           // c***, c****
  { pattern: /\bd[\*]+[a-z]*\b/i, label: 'dick' },           // d***, d****
  { pattern: /\bp[\*]+[a-z]*\b/i, label: 'pussy' },          // p****, p***y
  { pattern: /\b[a-z]?\*{2,}[a-z]?\b/i, label: 'profanity' },// any word masked with asterisks
  { pattern: /\b(b!tch|b\*tch|biatch|b1tch|btch|bich)\b/i, label: 'bitch' },
  { pattern: /\b(f\*ck|fuk|fck|phuck)\b/i, label: 'fuck' },
  { pattern: /\b(sh\*t|sh1t|sht)\b/i, label: 'shit' },
];

export interface ProfanityMatch {
  found: boolean;
  matchedWord: string | null;
  maskedSentence: string;
}

/**
 * Checks a text string for inappropriate language, handling both plain text,
 * asterisks from browser SpeechRecognition censorship, and variations.
 */
export function checkTextForProfanity(
  text: string,
  customBannedWords: string[] = []
): ProfanityMatch {
  if (!text || text.trim().length === 0) {
    return { found: false, matchedWord: null, maskedSentence: text };
  }

  const cleanText = text.trim();
  const lower = cleanText.toLowerCase();

  // 1. Check Chrome / WebSpeech asterisk-censored patterns (e.g. "b***h", "b****", "f***")
  for (const item of CENSORED_PATTERNS) {
    if (item.pattern.test(cleanText)) {
      return {
        found: true,
        matchedWord: item.label,
        maskedSentence: cleanText,
      };
    }
  }

  // 2. Check full raw word dictionary
  const allRawWords = Array.from(
    new Set([
      ...DEFAULT_PROFANITY_LIST,
      ...customBannedWords.map((w) => w.toLowerCase().trim()),
    ])
  );

  const wordsInText = lower.split(/[\s,.;:!?\-+*/_]+/).filter(Boolean);

  for (const rawWord of allRawWords) {
    if (!rawWord) continue;

    if (wordsInText.includes(rawWord)) {
      return {
        found: true,
        matchedWord: rawWord,
        maskedSentence: cleanText.replace(
          new RegExp(`\\b${rawWord}\\b`, 'gi'),
          rawWord[0] + '*'.repeat(rawWord.length - 1)
        ),
      };
    }

    const regex = new RegExp(`\\b${rawWord}\\b`, 'i');
    if (regex.test(lower)) {
      return {
        found: true,
        matchedWord: rawWord,
        maskedSentence: cleanText.replace(
          regex,
          rawWord[0] + '*'.repeat(rawWord.length - 1)
        ),
      };
    }
  }

  // 3. Check standalone multi-asterisks (e.g., "****")
  if (/\*{2,}/.test(cleanText)) {
    return {
      found: true,
      matchedWord: 'profanity',
      maskedSentence: cleanText,
    };
  }

  return {
    found: false,
    matchedWord: null,
    maskedSentence: cleanText,
  };
}

type ProfanityCallback = (word: string, transcript: string) => void;
type TranscriptCallback = (transcript: string, isFinal: boolean) => void;

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

export class ContinuousSpeechLanguageGuardian {
  private recognition: SpeechRecognitionInstance | null = null;
  private isRunning = false;
  private shouldRestart = false;
  private restartTimeout: ReturnType<typeof setTimeout> | null = null;
  private onProfanity: ProfanityCallback | null = null;
  private onTranscript: TranscriptCallback | null = null;
  private customWords: string[] = [];
  // Prevents re-triggering on the exact same utterance index in continuous speech
  private flaggedIndices = new Set<number>();

  constructor(customWords: string[] = []) {
    this.customWords = customWords;
  }

  setCustomWords(words: string[]) {
    this.customWords = words;
  }

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
  }

  start(onProfanity: ProfanityCallback, onTranscript?: TranscriptCallback): boolean {
    if (!this.isSupported()) return false;

    this.onProfanity = onProfanity;
    this.onTranscript = onTranscript || null;
    this.shouldRestart = true;
    this.flaggedIndices.clear();

    try {
      const SpeechRecognitionClass =
        (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

      if (!SpeechRecognitionClass) return false;

      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {}
      }

      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isRunning = true;
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Echo cancellation: if the app itself is shouting "Language!", ignore the mic audio!
        if (isAppCurrentlySpeaking()) {
          return;
        }

        let latestTranscript = '';
        let isFinalResult = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const text = (res[0]?.transcript || '').trim();
          latestTranscript = text;
          if (res.isFinal) isFinalResult = true;

          // If this utterance index was already flagged and reported, do not trigger again!
          if (this.flaggedIndices.has(i)) {
            continue;
          }

          let matched: ProfanityMatch | null = null;
          for (let a = 0; a < 3; a++) {
            const altText = res[a]?.transcript;
            if (altText) {
              const check = checkTextForProfanity(altText, this.customWords);
              if (check.found) {
                matched = check;
                break;
              }
            }
          }

          if (matched && matched.found && matched.matchedWord && this.onProfanity) {
            // Mark this index as flagged so it NEVER re-triggers in continuous loop
            this.flaggedIndices.add(i);
            this.onProfanity(matched.matchedWord, text);
          }
        }

        if (this.onTranscript && latestTranscript) {
          this.onTranscript(latestTranscript, isFinalResult);
        }
      };

      this.recognition.onerror = () => {
        // Silently recover
      };

      this.recognition.onend = () => {
        this.isRunning = false;
        if (this.shouldRestart) {
          if (this.restartTimeout) clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.shouldRestart && this.recognition) {
              try {
                this.flaggedIndices.clear();
                this.recognition.start();
                this.isRunning = true;
              } catch {}
            }
          }, 200);
        }
      };

      this.recognition.start();
      this.isRunning = true;
      return true;
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
      return false;
    }
  }

  stop() {
    this.shouldRestart = false;
    this.flaggedIndices.clear();
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }
    this.isRunning = false;
  }
}
