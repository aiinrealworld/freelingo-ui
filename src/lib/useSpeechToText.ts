import { useState, useRef, useCallback, useEffect } from 'react';

type SpeechToTextStatus = 'idle' | 'listening' | 'error';

// Add type declaration for SpeechRecognition if not present
// @ts-ignore
// eslint-disable-next-line
// TypeScript may not know about SpeechRecognition in the global scope

type _SpeechRecognition = typeof window extends { SpeechRecognition: infer T } ? T : any;

export function useSpeechToText() {
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<SpeechToTextStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (transcript) {
      console.log('Speech transcript:', transcript);
    }
  }, [transcript]);

  const startListening = useCallback(() => {
    setTranscript('');
    setError(null);
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      setStatus('error');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR'; // Set language as needed
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setStatus('listening');
    recognition.onerror = (event: any) => {
      setError(event.error || 'Speech recognition error');
      setStatus('error');
    };
    recognition.onresult = (event: any) => {
      setTranscript(event.results[0][0].transcript);
      setStatus('idle');
    };
    recognition.onend = () => setStatus('idle');

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus('idle');
  }, []);

  return {
    transcript,
    status,
    error,
    startListening,
    stopListening,
    isListening: status === 'listening',
  };
} 