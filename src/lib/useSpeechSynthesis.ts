import { useState, useRef, useCallback } from 'react';

interface UseSpeechSynthesisOptions {
  lang?: string;
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const synthRef = useRef<typeof window.speechSynthesis | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [lang, setLang] = useState(options.lang || 'fr-FR');

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech is not supported in this browser.');
      return;
    }
    setError(null);
    synthRef.current = window.speechSynthesis;
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = lang;
    // Try to pick a French voice if available
    const voices = synthRef.current.getVoices();
    const voice = voices.find(v => v.lang === lang);
    if (voice) utter.voice = voice;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = (e) => {
      setError('Speech synthesis error');
      setSpeaking(false);
    };
    utterRef.current = utter;
    synthRef.current.speak(utter);
  }, [lang]);

  const cancel = useCallback(() => {
    synthRef.current?.cancel();
    setSpeaking(false);
  }, []);

  return {
    speak,
    speaking,
    cancel,
    error,
    setLanguage: setLang,
    language: lang,
  };
} 