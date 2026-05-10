import React from 'react';
import { useNavigate } from 'react-router';
import {
  Mic,
  Pill,
  ChevronRight,
  Clock,
  Settings,
  Globe,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

const LANGUAGE_FLAGS: Record<string, string> = {
  'Afrikaans': '🇿🇦',
  'Albanian': '🇦🇱',
  'Amharic': '🇪🇹',
  'Arabic': '🇸🇦',
  'Armenian': '🇦🇲',
  'Assamese': '🇮🇳',
  'Azerbaijani': '🇦🇿',
  'Basque': '🇪🇸',
  'Belarusian': '🇧🇾',
  'Bengali': '🇧🇩',
  'Bosnian': '🇧🇦',
  'Bulgarian': '🇧🇬',
  'Catalan': '🇪🇸',
  'Chinese (Simplified)': '🇨🇳',
  'Chinese (Traditional)': '🇹🇼',
  'Chinese (Hong Kong)': '🇭🇰',
  'Croatian': '🇭🇷',
  'Czech': '🇨🇿',
  'Danish': '🇩🇰',
  'Dutch': '🇳🇱',
  'English': '🇺🇸',
  'Estonian': '🇪🇪',
  'Farsi': '🇮🇷',
  'Filipino': '🇵🇭',
  'Finnish': '🇫🇮',
  'French': '🇫🇷',
  'Galician': '🇪🇸',
  'Georgian': '🇬🇪',
  'German': '🇩🇪',
  'Greek': '🇬🇷',
  'Gujarati': '🇮🇳',
  'Hebrew': '🇮🇱',
  'Hindi': '🇮🇳',
  'Hungarian': '🇭🇺',
  'Icelandic': '🇮🇸',
  'Indonesian': '🇮🇩',
  'Italian': '🇮🇹',
  'Japanese': '🇯🇵',
  'Kannada': '🇮🇳',
  'Kazakh': '🇰🇿',
  'Khmer': '🇰🇭',
  'Korean': '🇰🇷',
  'Lao': '🇱🇦',
  'Latvian': '🇱🇻',
  'Lithuanian': '🇱🇹',
  'Macedonian': '🇲🇰',
  'Malay': '🇲🇾',
  'Malayalam': '🇮🇳',
  'Marathi': '🇮🇳',
  'Mongolian': '🇲🇳',
  'Nepali': '🇳🇵',
  'Norwegian': '🇳🇴',
  'Odia': '🇮🇳',
  'Polish': '🇵🇱',
  'Portuguese': '🇵🇹',
  'Punjabi': '🇮🇳',
  'Romanian': '🇷🇴',
  'Russian': '🇷🇺',
  'Serbian': '🇷🇸',
  'Slovak': '🇸🇰',
  'Slovenian': '🇸🇮',
  'Spanish': '🇪🇸',
  'Swahili': '🇰🇪',
  'Swedish': '🇸🇪',
  'Tamil': '🇮🇳',
  'Telugu': '🇮🇳',
  'Thai': '🇹🇭',
  'Turkish': '🇹🇷',
  'Ukrainian': '🇺🇦',
  'Urdu': '🇵🇰',
  'Uzbek': '🇺🇿',
  'Vietnamese': '🇻🇳',
  'Zulu': '🇿🇦',
};



export function Home() {
  const navigate = useNavigate();
  const { profile, sessions } = useProfile();

  const greeting = getGreeting();
  const flag = profile?.language ? LANGUAGE_FLAGS[profile.language] ?? '🌐' : '🌐';

  return (
    <div className="min-h-full pb-4 bg-background" style={{}}>
      {/* Header */}
      <div
        className="px-4 pt-5 pb-6 bg-primary"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-primary-foreground" style={{ fontSize: '14px', opacity: 0.7, marginBottom: 2 }}>
              {greeting}
            </p>
            <h1
              className="text-primary-foreground"
              style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.2 }}
            >
              {profile?.name ? `${profile.name}` : 'Welcome back'}
            </h1>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <Settings size={18} className="text-primary-foreground" />
          </button>
        </div>

        {/* Profile chip */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <span style={{ fontSize: '16px' }}>{flag}</span>
          <span className="text-primary-foreground" style={{ fontSize: '13px', opacity: 0.9, fontWeight: 500 }}>
            {profile?.language ?? 'Spanish'}
          </span>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Primary CTA — Start Session */}
        <button
          onClick={() => navigate('/session')}
          className="w-full flex items-center gap-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg bg-accent text-accent-foreground"
          style={{
            padding: '20px 24px',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Mic size={28} className="text-accent-foreground" />
          </div>
          <div className="text-left">
            <p style={{ fontSize: '18px', fontWeight: 700 }}>Start Session</p>
            <p className="text-accent-foreground" style={{ fontSize: '13px', opacity: 0.8, marginTop: 2 }}>
              Real-time translation · AI adapted
            </p>
          </div>
          <ChevronRight size={20} className="text-accent-foreground ml-auto" style={{ opacity: 0.6 }} />
        </button>

        {/* Medication Explainer */}
        <button
          onClick={() => navigate('/medication')}
          className="w-full flex items-center gap-4 rounded-2xl bg-card border-2 border-muted transition-all active:scale-[0.98]"
          style={{ padding: '16px 20px' }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-muted"
          >
            <Pill size={24} className="text-accent" />
          </div>
          <div className="text-left">
            <p className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
              Medication Explainer
            </p>
            <p className="text-muted-foreground" style={{ fontSize: '13px', marginTop: 2 }}>
              Understand any prescription · Side effects
            </p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground ml-auto" />
        </button>

        {/* Recent Sessions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground" style={{ fontSize: '16px', fontWeight: 700 }}>
              Recent Sessions
            </h3>
            <span className="text-accent" style={{ fontSize: '13px', fontWeight: 500 }}>
              {sessions.length} total
            </span>
          </div>

          {sessions.length === 0 ? (
            <div
              className="rounded-2xl p-8 flex flex-col items-center gap-3 bg-card border-2 border-dashed border-muted"
            >
              <Clock size={32} className="text-muted" />
              <p className="text-muted-foreground" style={{ fontSize: '15px', textAlign: 'center' }}>
                No sessions yet. Start your first session to see your history here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sessions.slice(0, 5).map((session, index) => (
                <div
                  key={session.id}
                  className="rounded-xl p-4 border shadow-sm"
                  style={{
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#E8F3EF',
                    borderColor: index % 2 === 0 ? '#E2E8F0' : '#C7DDD5',
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-foreground" style={{ fontSize: '15px', fontWeight: 600 }}>
                      {session.title}
                    </p>
                    <span className="text-muted-foreground" style={{ fontSize: '12px', marginLeft: 8, shrink: 0 }}>
                      {session.date}
                    </span>
                  </div>
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontSize: '13px',
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {session.translatedText}
                  </p>
                  {session.culturalNote && (
                    <div
                      className="mt-2 px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: index % 2 === 0 ? '#F8FAFA' : '#D4E7DF',
                      }}
                    >
                      <p className="text-accent" style={{ fontSize: '12px' }}>
                        {session.culturalNote}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info note */}
        <div
          className="rounded-xl p-4 bg-card border border-muted"
        >
          <p className="text-accent" style={{ fontSize: '13px', lineHeight: 1.6 }}>
            <strong>Tip:</strong> Use ClarityMD before appointments to prepare questions, during
            appointments to translate in real time, or after to review what was discussed.
          </p>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}