import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Send, Volume2, ChevronDown, RotateCcw } from 'lucide-react';
import { WaveformVisualizer } from '../components/WaveformVisualizer';
import { useProfile } from '../context/ProfileContext';

type SessionState = 'idle' | 'listening' | 'processing' | 'playing' | 'ready';

interface Message {
  id: string;
  original: string;
  translated: string;
  culturalNote?: string;
  type: 'doctor' | 'patient';
}

// Mock demo content
const MOCK_EXCHANGES = [
  {
    original:
      "Your blood pressure today is 140 over 90. This is what we call stage 2 hypertension. I want to start you on a medication called Lisinopril — 10 milligrams, once a day in the morning. This is a very safe and commonly used medication.",
    translated:
      "Su presión arterial hoy es 140 sobre 90. A esto lo llamamos hipertensión de etapa 2. Quiero comenzarle con un medicamento llamado Lisinopril — 10 miligramos, una vez al día por la mañana. Este es un medicamento muy seguro y de uso común.",
    culturalNote:
      "Su esposo también podría querer escuchar esto. Con apoyo familiar y los medicamentos correctos, muchas personas viven muy bien con esta condición.",
  },
  {
    original:
      "It's very important that you take this medication every day, even if you feel fine. High blood pressure usually has no symptoms, but it can damage your heart and kidneys over time.",
    translated:
      "Es muy importante que tome este medicamento todos los días, aunque se sienta bien. La presión arterial alta generalmente no tiene síntomas, pero puede dañar su corazón y riñones con el tiempo.",
    culturalNote: undefined,
  },
];

const MOCK_QA: Record<string, string> = {
  default:
    "Entiendo su pregunta. Basándome en lo que su doctor explicó hoy, el Lisinopril es seguro para la mayoría de las personas. Sin embargo, le recomiendo hablar directamente con su doctor sobre cualquier preocupación específica. Esta es una buena pregunta para hacerle en su próxima visita.",
  lisinopril:
    "El Lisinopril es un medicamento que ayuda a relajar sus vasos sanguíneos, lo que hace más fácil para su corazón bombear sangre. Se toma una vez al día, generalmente por la mañana, con o sin comida. Los efectos secundarios comunes incluyen una tos seca — si esto ocurre, dígale a su doctor.",
  efectos:
    "Los efectos secundarios más comunes del Lisinopril son: tos seca, mareos (especialmente al levantarse rápido), y a veces cansancio. En casos raros puede causar una reacción alérgica. Llame a su doctor de inmediato si nota hinchazón en la cara o dificultad para respirar.",
};

const DOCTOR_SPEECH_WORDS = MOCK_EXCHANGES[0].original.split(' ');

export function Session() {
  const { profile, addSession } = useProfile();
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [currentExchangeIdx, setCurrentExchangeIdx] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [liveText, setLiveText] = useState('');
  const [liveWords, setLiveWords] = useState<string[]>([]);
  const [qaInput, setQaInput] = useState('');
  const [showQA, setShowQA] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const wordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const language = profile?.language ?? 'Spanish';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, liveWords, sessionState]);

  const startListening = () => {
    if (sessionState !== 'idle' && sessionState !== 'ready') return;
    setSessionStarted(true);
    setSessionState('listening');
    setLiveWords([]);
    setLiveText('');

    const exchange = MOCK_EXCHANGES[currentExchangeIdx % MOCK_EXCHANGES.length];
    const words = exchange.original.split(' ');
    let wordIdx = 0;

    const addWord = () => {
      if (wordIdx < words.length) {
        setLiveWords((prev) => [...prev, words[wordIdx]]);
        wordIdx++;
        wordTimerRef.current = setTimeout(addWord, 110 + Math.random() * 80);
      } else {
        // Speech ended — process
        setTimeout(() => {
          setSessionState('processing');
          setTimeout(() => {
            setSessionState('playing');
            const newMsg: Message = {
              id: Date.now().toString(),
              original: exchange.original,
              translated: exchange.translated,
              culturalNote: exchange.culturalNote,
              type: 'doctor',
            };
            setMessages((prev) => [...prev, newMsg]);
            setLiveWords([]);
            setCurrentExchangeIdx((i) => i + 1);

            // Save to history after first exchange
            if (messages.length === 0) {
              addSession({
                id: Date.now().toString(),
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                title: 'Doctor Appointment — Live Session',
                originalText: exchange.original,
                translatedText: exchange.translated,
                culturalNote: exchange.culturalNote,
              });
            }

            setTimeout(() => {
              setSessionState('ready');
              setShowQA(true);
            }, 3000);
          }, 2000);
        }, 500);
      }
    };

    wordTimerRef.current = setTimeout(addWord, 400);
  };

  const stopSession = () => {
    if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
    setSessionState('idle');
    setLiveWords([]);
    setShowQA(false);
  };

  const resetSession = () => {
    stopSession();
    setMessages([]);
    setCurrentExchangeIdx(0);
    setSessionStarted(false);
    setShowQA(false);
  };

  const handleQASend = () => {
    if (!qaInput.trim()) return;
    const q = qaInput.trim();
    setQaInput('');

    const qMsg: Message = {
      id: Date.now().toString(),
      original: q,
      translated: q,
      type: 'patient',
    };
    setMessages((prev) => [...prev, qMsg]);

    // Mock AI response
    setTimeout(() => {
      const lower = q.toLowerCase();
      let answer = MOCK_QA.default;
      if (lower.includes('lisinopril') || lower.includes('medicamento') || lower.includes('medication')) {
        answer = MOCK_QA.lisinopril;
      } else if (lower.includes('efecto') || lower.includes('side effect') || lower.includes('secundario')) {
        answer = MOCK_QA.efectos;
      }

      const aMsg: Message = {
        id: (Date.now() + 1).toString(),
        original: answer,
        translated: answer,
        type: 'doctor',
      };
      setMessages((prev) => [...prev, aMsg]);
    }, 1400);
  };

  const statusLabel = {
    idle: 'Ready to start',
    listening: 'Listening...',
    processing: 'Translating...',
    playing: `Playing in ${language}`,
    ready: 'Ready for more',
  }[sessionState];

  const statusColor = {
    idle: 'rgba(255,255,255,0.7)',
    listening: '#A8E6CF',
    processing: '#A8E6CF',
    playing: '#A8E6CF',
    ready: '#A8E6CF',
  }[sessionState];

  return (
    <div
      className="flex flex-col h-full bg-background"
      style={{}}
    >
      {/* Session header */}
      <div
        className="px-4 pt-4 pb-3 bg-primary"
        style={{ shrink: 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-primary-foreground" style={{ fontSize: '17px', fontWeight: 700 }}>Live Session</h2>
            <p className="text-primary-foreground" style={{ fontSize: '13px', opacity: 0.75 }}>
              {language} · {profile?.name ?? 'Patient'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sessionStarted && (
              <button
                onClick={resetSession}
                className="w-8 h-8 flex items-center justify-center rounded-full text-primary-foreground"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: statusColor,
              boxShadow: sessionState === 'listening' ? `0 0 0 4px ${statusColor}30` : undefined,
            }}
          />
          <span style={{ fontSize: '13px', color: statusColor, fontWeight: 500 }}>
            {statusLabel}
          </span>
          {sessionState === 'processing' && (
            <span style={{ fontSize: '13px', color: '#A8E6CF' }}>— AI cultural adaptation...</span>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Idle state */}
        {!sessionStarted && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 py-8">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center bg-muted border-4 border-accent"
              style={{ borderColor: 'var(--accent)', opacity: 0.3 }}
            >
              <Mic size={40} className="text-accent" />
            </div>
            <div className="text-center">
              <p className="text-foreground" style={{ fontSize: '17px', fontWeight: 600, marginBottom: 6 }}>
                Ready to listen
              </p>
              <p className="text-muted-foreground" style={{ fontSize: '14px', lineHeight: 1.6, maxWidth: 260 }}>
                Press the button below and point your device toward the speaker. ClarityMD will
                translate in real time.
              </p>
            </div>

            <div
              className="rounded-xl p-4 w-full bg-card border border-muted"
            >
              <p className="text-accent" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                <strong>Demo mode:</strong> Tap "Start Listening" to see a simulated doctor–patient exchange. The AI translation and cultural adaptation are shown in real time.
              </p>
            </div>
          </div>
        )}

        {/* Live transcription — doctor speaking */}
        {sessionState === 'listening' && liveWords.length > 0 && (
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: '#E8F3EF', border: '1px solid #C7DDD5' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>
                CAPTURING — DOCTOR'S SPEECH
              </span>
            </div>
            <WaveformVisualizer isActive={true} color="var(--accent)" size="sm" />
            <p
              style={{
                fontSize: '15px',
                color: '#374151',
                lineHeight: 1.7,
                marginTop: 8,
                fontStyle: 'italic',
              }}
            >
              "{liveWords.join(' ')}"
            </p>
          </div>
        )}

        {/* Processing state */}
        {sessionState === 'processing' && (
          <div
            className="rounded-2xl p-4 flex flex-col gap-2"
            style={{ backgroundColor: '#E8F3EF', border: '1px solid #C7DDD5' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>
                AI PROCESSING — CULTURAL ADAPTATION
              </span>
            </div>
            <div className="flex gap-1 mt-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: 'var(--accent)',
                    animation: `bounce 0.8s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.type === 'patient' ? (
              <div className="flex justify-end">
                <div
                  className="max-w-xs rounded-2xl rounded-tr-md px-4 py-3 bg-accent"
                >
                  <p className="text-accent-foreground" style={{ fontSize: '15px', lineHeight: 1.6 }}>
                    {msg.original}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Original (collapsed label) */}
                <div
                  className="rounded-xl px-3 py-2 bg-muted border border-border"
                >
                  <p className="text-muted-foreground" style={{ fontSize: '11px', fontWeight: 600, marginBottom: 2 }}>
                    DOCTOR (ORIGINAL)
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: '13px', lineHeight: 1.5, fontStyle: 'italic' }}>
                    "{msg.original}"
                  </p>
                </div>

                {/* Translated — main output */}
                <div
                  className="rounded-2xl p-4 bg-card border-2 border-accent"
                  style={{ borderColor: 'var(--accent)', opacity: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 size={14} className="text-accent" />
                    <span className="text-accent" style={{ fontSize: '11px', fontWeight: 600 }}>
                      {language.toUpperCase()} · ADAPTED FOR YOU
                    </span>
                    <WaveformVisualizer
                      isActive={sessionState === 'playing' && messages[messages.length - 1]?.id === msg.id}
                      color="var(--accent)"
                      size="sm"
                    />
                  </div>
                  <p className="text-foreground" style={{ fontSize: '18px', lineHeight: 1.7, fontWeight: 500 }}>
                    {msg.translated}
                  </p>
                </div>

                {/* Cultural note */}
                {msg.culturalNote && (
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{ backgroundColor: '#E8F3EF', border: '1px solid #C7DDD5' }}
                  >
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', marginBottom: 3 }}>
                      CULTURAL CONTEXT
                    </p>
                    <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
                      {msg.culturalNote}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Q&A prompt */}
        {showQA && messages.length > 0 && (
          <div
            className="rounded-xl p-3 bg-card border border-muted"
          >
            <p className="text-accent" style={{ fontSize: '13px', lineHeight: 1.5 }}>
              <strong>Do you have questions?</strong> Type below in any language — ClarityMD will answer in {language}.
            </p>
          </div>
        )}

        <div style={{ height: 16 }} />
      </div>

      {/* Bottom controls */}
      <div
        className="bg-card border-t border-border px-4 py-3 flex flex-col gap-3"
        style={{ shrink: 0 }}
      >
        {/* Q&A input */}
        {showQA && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Escriba su pregunta en ${language}...`}
              value={qaInput}
              onChange={(e) => setQaInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQASend()}
              className="flex-1 rounded-xl border-2 border-border px-3 bg-input-background focus:outline-none focus:border-accent transition-colors"
              style={{ height: 44, fontSize: '15px' }}
            />
            <button
              onClick={handleQASend}
              disabled={!qaInput.trim()}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95"
              style={{
                backgroundColor: qaInput.trim() ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              <Send size={18} className={qaInput.trim() ? 'text-accent-foreground' : 'text-muted-foreground'} />
            </button>
          </div>
        )}

        {/* Main session button */}
        {sessionState === 'idle' || sessionState === 'ready' ? (
          <button
            onClick={startListening}
            className="w-full flex items-center justify-center gap-3 rounded-2xl transition-all active:scale-95 bg-accent text-accent-foreground"
            style={{
              height: 60,
              fontSize: '17px',
              fontWeight: 700,
            }}
          >
            <Mic size={24} />
            {sessionState === 'ready' ? 'Listen Again' : 'Start Listening'}
          </button>
        ) : sessionState === 'listening' ? (
          <button
            onClick={stopSession}
            className="w-full flex items-center justify-center gap-3 rounded-2xl text-white transition-all active:scale-95"
            style={{
              backgroundColor: '#374151',
              height: 60,
              fontSize: '17px',
              fontWeight: 700,
            }}
          >
            <Square size={20} />
            Stop
          </button>
        ) : (
          <div
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-muted"
            style={{
              height: 60,
            }}
          >
            {sessionState === 'playing' && (
              <>
                <Volume2 size={20} className="text-accent" />
                <WaveformVisualizer isActive={true} color="var(--accent)" size="sm" />
                <span className="text-accent" style={{ fontSize: '15px', fontWeight: 600 }}>
                  Playing in {language}
                </span>
              </>
            )}
            {sessionState === 'processing' && (
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#B45309' }}>
                AI translating...
              </span>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}