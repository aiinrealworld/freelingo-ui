import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

import { useSpeechToText } from '../lib/useSpeechToText'
import { useSpeechSynthesis } from '../lib/useSpeechSynthesis'
import { saveDialogueSession } from '../lib/api'

interface Message {
  id: string
  text: string
  sender: 'ai' | 'user'
  timestamp: Date
}

function DialoguePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Prime the speech synthesis engine on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const u = new window.SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  }, []);

  // Start the conversation with AI when component mounts
  useEffect(() => {
    const startConversation = async () => {
      if (!user?.uid) return;
      
      setIsLoading(true);
      try {
        const response = await api.sendMessage('', user.uid);
        
        // Extract AI's reply from the transcript
        if (response.transcript && response.transcript.length > 0) {
          const lastEntry = response.transcript[response.transcript.length - 1];
          const aiText = lastEntry.ai_turn.ai_reply.text;
          
          const aiMessage: Message = {
            id: Date.now().toString(),
            text: aiText,
            sender: 'ai',
            timestamp: new Date()
          }
          
          setMessages([aiMessage]);
        } else {
          // Fallback if no transcript
          const fallbackMessage: Message = {
            id: Date.now().toString(),
            text: 'Bonjour! Comment puis-je vous aider aujourd\'hui?',
            sender: 'ai',
            timestamp: new Date()
          }
          setMessages([fallbackMessage]);
        }
      } catch (err) {
        console.error('Failed to start conversation:', err);
        // Add a fallback message if the API fails
        const fallbackMessage: Message = {
          id: Date.now().toString(),
          text: 'Bonjour! Comment puis-je vous aider aujourd\'hui?',
          sender: 'ai',
          timestamp: new Date()
        }
        setMessages([fallbackMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    startConversation();
  }, [user?.uid]);
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Session start and end times are now calculated at save time

  // Remove totalExchanges and progress logic
  // const totalExchanges = 10
  // const currentExchange = Math.min(messages.length, totalExchanges)
  // const progress = (currentExchange / totalExchanges) * 100

  const {
    transcript,
    error: sttError,
    startListening,
    stopListening,
    isListening,
  } = useSpeechToText();

  const {
    speak,
  } = useSpeechSynthesis({ lang: 'fr-FR' });

  // When transcript changes, set it as input text
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Combine errors
  useEffect(() => {
    if (sttError) setError(sttError);
  }, [sttError]);

  // Speak the latest AI message when it is added
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'ai' && lastMsg.text) {
        speak(lastMsg.text);
      }
    }
  }, [messages, speak]);

  // Swallow TTS errors - they don't affect user experience
  // useEffect(() => {
  //   if (ttsError) setError(ttsError);
  // }, [ttsError]);

  // Auto-save functionality - no user warnings needed
  // useEffect(() => {
  //   const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  //     if (messages.length > 2) { // More than just the initial AI message and one user response
  //       e.preventDefault();
  //       e.returnValue = 'You have unsaved dialogue messages. Are you sure you want to leave?';
  //       return e.returnValue;
  //     }
  //   };

  //   window.addEventListener('beforeunload', handleBeforeUnload);
  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //   };
  // }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user?.uid) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.sendMessage(inputText, user.uid)
      
      // Extract AI's reply from the transcript
      if (response.transcript && response.transcript.length > 0) {
        const lastEntry = response.transcript[response.transcript.length - 1];
        const aiText = lastEntry.ai_turn.ai_reply.text;
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiText,
          sender: 'ai',
          timestamp: new Date()
        }

        setMessages(prev => [...prev, aiMessage])
      } else {
        // Fallback if no transcript
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Je ne comprends pas. Pouvez-vous répéter?',
          sender: 'ai',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, fallbackMessage])
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      setError('Failed to send message. Please try again.')
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicClick = () => {
    if (!user?.uid) return;
    if (isListening) {
      stopListening();
    } else {
      setError(null);
      startListening();
    }
  };

  const handleEndSession = async () => {
    if (user?.uid && messages.length > 0) {
      try {
        // Calculate session times at the moment of saving
        const currentSessionStart = messages.length > 0 ? new Date(messages[0].timestamp).toISOString() : '';
        const currentSessionEnd = messages.length > 0 ? new Date(messages[messages.length - 1].timestamp).toISOString() : '';
        
        // Convert timestamps to ISO strings for backend
        const messagesToSave = messages.map(m => ({ ...m, timestamp: new Date(m.timestamp).toISOString() }));
        await saveDialogueSession(user.uid, messagesToSave, currentSessionStart, currentSessionEnd);
        // Navigate immediately after saving
        navigate('/dashboard');
      } catch (err) {
        console.error('Failed to save session:', err);
        // Still navigate away even if save fails
        navigate('/dashboard');
      }
    } else {
      // If no messages or no user, just navigate away
      navigate('/dashboard');
    }
  }

  const handleSaveSession = async () => {
    if (!user?.uid || messages.length === 0) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      // Calculate session times at the moment of saving
      const currentSessionStart = messages.length > 0 ? new Date(messages[0].timestamp).toISOString() : '';
      const currentSessionEnd = messages.length > 0 ? new Date(messages[messages.length - 1].timestamp).toISOString() : '';
      
      // Convert timestamps to ISO strings for backend
      const messagesToSave = messages.map(m => ({ ...m, timestamp: new Date(m.timestamp).toISOString() }));
      await saveDialogueSession(user.uid, messagesToSave, currentSessionStart, currentSessionEnd);
      setSaveStatus('Session saved!');
    } catch (err) {
      setSaveStatus('Failed to save session.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                ← Back to Dashboard
              </Button>
            </div>
            <h1 className="text-xl font-bold text-gray-900">AI Dialogue</h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEndSession}
              >
                End Session
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveSession}
                disabled={saving || messages.length === 0}
              >
                {saving ? 'Saving...' : 'Save Session'}
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Show save status */}
      {saveStatus && (
        <div className={`max-w-4xl mx-auto mt-2 px-4`}>
          <div className={`rounded p-2 text-center ${saveStatus.includes('saved') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{saveStatus}</div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Exchanges: {messages.length}
            </span>
          </div>
          {/* Optionally remove the Progress component or leave it out */}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4">
            {error && (
              <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading || !user?.uid}
              />
              <Button
                onClick={handleMicClick}
                disabled={isLoading || !user?.uid}
                variant="outline"
                size="icon"
                className={`w-10 h-10 ${isListening ? 'bg-red-100 border-red-300 text-red-600' : ''}`}
              >
                {isListening ? (
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading || !user?.uid}
                className="px-6"
              >
                Send
              </Button>
            </div>
            {isListening && (
              <p className="text-sm text-red-600 mt-2 text-center">
                Recording... Speak now
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DialoguePage 