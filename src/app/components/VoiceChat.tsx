"use client";
import React, { useState, useEffect, useRef } from 'react';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

interface VoiceChatProps {
  onBack: () => void;
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const VoiceChat: React.FC<VoiceChatProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [mode, setMode] = useState<'chat' | 'avatar'>('chat');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [mouthOpen, setMouthOpen] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  const API_BASE_URL = 'http://127.0.0.1:5000';

  useEffect(() => {
    const audio = new Audio();
    setAudioElement(audio);
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);

    // Set up audio analysis
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    const source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);
    analyserRef.current = analyser;

    // Animation function for lip sync
    const animate = () => {
      if (!analyserRef.current || !isAvatarSpeaking) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteTimeDomainData(dataArray);

      // Calculate audio volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += Math.abs(dataArray[i] - 128);
      }
      const volume = sum / dataArray.length;

      // Update mouth state based on volume threshold
      setMouthOpen(volume > 5);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    audio.onplay = () => {
      setIsAvatarSpeaking(true);
      animate();
    };

    audio.onended = () => {
      setIsAvatarSpeaking(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setMouthOpen(false);
    };

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = selectedLanguage;

      recognitionInstance.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setMessages(prev => [...prev, { text, sender: 'user' }]);

        try {
          const lang = selectedLanguage.split('-')[0];
          const res = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, lang })
          });

          const { reply } = await res.json();
          setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);

          if (mode === 'avatar' && audioElement) {
            const ttsRes = await fetch(`${API_BASE_URL}/tts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: reply, lang })
            });

            const blob = await ttsRes.blob();
            audioElement.src = URL.createObjectURL(blob);
            await audioElement.play();
          }
        } catch (error) {
          console.error('Error:', error);
          setMessages(prev => [...prev, {
            text: 'Sorry, I encountered an error. Please try again.',
            sender: 'bot'
          }]);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (audioContext) {
        audioContext.close();
      }
      if (recognition) {
        recognition.abort();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mode, selectedLanguage]);

  const handleStartListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setMessages(prev => [...prev, { text: inputMessage, sender: 'user' }]);
    const message = inputMessage;
    setInputMessage('');

    try {
      const lang = selectedLanguage.split('-')[0];
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message, lang })
      });

      const { reply } = await res.json();
      setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot'
      }]);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f0f2f5]">
      {/* Header */}
      <div className="bg-[#128C7E] text-white px-4 py-3 flex items-center gap-4 shadow-md mt-[60px]">
        <button
          onClick={onBack}
          className="hover:bg-[#0c6b5f] p-2 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
            <img
              src="/avatar 1.png"
              alt="AI Assistant"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-semibold">Pregnancy Assistant</h2>
            <p className="text-xs opacity-90">
              {isListening ? 'Listening...' : 'Online'}
            </p>
          </div>
        </div>

        {/* Language selector */}
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="ml-auto bg-[#0c6b5f] text-white px-2 py-1 rounded"
        >
          <option value="en-US">English</option>
          <option value="hi-IN">Hindi</option>
          <option value="ta-IN">Tamil</option>
          <option value="te-IN">Telugu</option>
          <option value="ml-IN">Malayalam</option>
          <option value="kn-IN">Kannada</option>
          <option value="mr-IN">Marathi</option>
          <option value="gu-IN">Gujarati</option>
          <option value="bn-IN">Bengali</option>
          <option value="pa-IN">Punjabi</option>
          <option value="ur-IN">Urdu</option>
        </select>
      </div>

      {/* Mode selector */}
      <div className="bg-white border-b px-4 py-2 flex justify-center gap-4">
        <button
          onClick={() => setMode('chat')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            mode === 'chat'
              ? 'bg-[#128C7E] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Text Chat
        </button>
        <button
          onClick={() => setMode('avatar')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            mode === 'avatar'
              ? 'bg-[#128C7E] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Voice Chat
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {mode === 'chat' ? (
          // Chat messages
          <div className="h-full overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] break-words rounded-lg px-4 py-2 ${
                  msg.sender === 'user'
                    ? 'bg-[#DCF8C6] ml-4'
                    : 'bg-white mr-4'
                }`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Voice chat mode with animated avatar
          <div className="h-full flex flex-col items-center justify-center bg-gray-900">
            <div className="relative w-64 h-64 mb-6">
              <div className={`absolute inset-0 ${isListening ? 'ring-beam' : ''}`}>
                <img
                  src={mouthOpen ? "/open1.png" : "/closed1.png"}
                  alt="AI Assistant Avatar"
                  className={`w-full h-full transition-all duration-300 ${
                    isListening ? 'scale-105' : 'scale-100'
                  }`}
                />
              </div>
            </div>

            <button
              onClick={handleStartListening}
              className={`px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 scale-110'
                  : 'bg-[#128C7E] hover:bg-[#0c6b5f]'
              } text-white shadow-lg hover:shadow-xl`}
            >
              {isListening ? 'Stop Speaking' : 'Start Speaking'}
            </button>
          </div>
        )}
      </div>

      {/* Input area - Only shown in chat mode */}
      {mode === 'chat' && (
        <div className="bg-[#f0f2f5] px-4 py-3 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message"
            className="flex-1 rounded-lg px-4 py-2 bg-white border-0 focus:ring-2 focus:ring-[#128C7E] focus:outline-none"
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="p-3 rounded-full bg-[#128C7E] text-white hover:bg-[#0c6b5f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};