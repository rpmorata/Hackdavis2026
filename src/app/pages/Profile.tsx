import React from 'react';
import { useNavigate } from 'react-router';
import { Globe, Users, MessageSquare, Volume2, LogOut, ChevronRight, Shield } from 'lucide-react';
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


function ProfileRow({
  icon: Icon,
  label,
  value,
  color = 'var(--accent)',
}: {
  icon: any;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + '18' }}
      >
        <Icon size={16} color={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-muted-foreground" style={{ fontSize: '12px', fontWeight: 500 }}>{label}</p>
        <p className="text-foreground" style={{ fontSize: '15px', fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  );
}

export function Profile() {
  const navigate = useNavigate();
  const { profile, clearProfile, sessions } = useProfile();

  const handleReset = () => {
    if (window.confirm('Reset your profile and start over?')) {
      clearProfile();
      navigate('/');
    }
  };

  const flag = profile?.language ? LANGUAGE_FLAGS[profile.language] ?? '🌐' : '🌐';

  const decisionLabel = {
    myself: 'I decide for myself',
    shared: 'Shared with family',
    family: 'Family decides',
  }[profile?.decisionMaker ?? 'myself'];

  const toneLabel = {
    direct: 'Direct and clear',
    warm: 'Warm and conversational',
    gentle: 'Very gentle and slow',
  }[profile?.communicationTone ?? 'warm'];

  const formatLabel = {
    voice: 'Voice only',
    text: 'Text only',
    both: 'Voice and text',
  }[profile?.outputFormat ?? 'both'];

  return (
    <div
      className="min-h-full pb-4 bg-background"
      style={{}}
    >
      {/* Header */}
      <div
        className="px-4 pt-5 pb-6 bg-primary"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', fontSize: '28px' }}
          >
            {flag}
          </div>
          <div>
            <h1 className="text-primary-foreground" style={{ fontSize: '22px', fontWeight: 700 }}>
              {profile?.name || 'My Profile'}
            </h1>
            <p className="text-primary-foreground" style={{ fontSize: '14px', opacity: 0.65 }}>
              {profile?.language ?? 'Spanish'} · {profile?.culturalBackground ?? 'Not set'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Language & Literacy */}
        <div className="rounded-2xl p-4 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
          <h3 className="text-muted-foreground" style={{ fontSize: '14px', fontWeight: 700, marginBottom: 4 }}>
            LANGUAGE & LITERACY
          </h3>
          <ProfileRow icon={Globe} label="Medical language" value={profile?.language ?? '—'} color="var(--accent)" />
          <ProfileRow
            icon={MessageSquare}
            label="Terminology level"
            value={
              { clinical: 'Clinical terms', plain: 'Plain language', simple: 'Very simple' }[
                profile?.medicalTerminology ?? 'plain'
              ]
            }
            color="var(--accent)"
          />
          <ProfileRow
            icon={Volume2}
            label="Health literacy"
            value={
              { fluent: 'Fluent reader', some: 'Some reading', audio: 'Prefers audio' }[
                profile?.healthLiteracy ?? 'fluent'
              ]
            }
            color="var(--accent)"
          />
        </div>

        {/* Cultural Background */}
        <div className="rounded-2xl p-4 border" style={{ backgroundColor: '#E8F3EF', borderColor: '#C7DDD5' }}>
          <h3 className="text-muted-foreground" style={{ fontSize: '14px', fontWeight: 700, marginBottom: 4 }}>
            CULTURAL BACKGROUND
          </h3>
          <ProfileRow
            icon={Globe}
            label="Country of origin"
            value={profile?.culturalBackground || '—'}
            color="var(--accent)"
          />
          <ProfileRow
            icon={Globe}
            label="Time in the US"
            value={
              { recent: 'Less than 1 year', '1-5': '1–5 years', '5+': '5+ years', born: 'Born in the US', '': '—' }[
                profile?.timeInUS ?? ''
              ]
            }
            color="var(--accent)"
          />
          {profile?.religion && (
            <ProfileRow icon={Globe} label="Religious affiliation" value={profile.religion} color="var(--accent)" />
          )}
        </div>

        {/* Family & Decisions */}
        <div className="rounded-2xl p-4 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
          <h3 className="text-muted-foreground" style={{ fontSize: '14px', fontWeight: 700, marginBottom: 4 }}>
            FAMILY & DECISIONS
          </h3>
          <ProfileRow icon={Users} label="Medical decisions" value={decisionLabel} color="var(--accent)" />
          {profile?.familyName && (
            <ProfileRow icon={Users} label="Family spokesperson" value={profile.familyName} color="var(--accent)" />
          )}
        </div>

        {/* Privacy & Compliance */}
        <div
          className="rounded-2xl p-4 bg-card border border-muted"
        >
          <div className="flex items-start gap-3">
            <Shield size={18} className="text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-accent" style={{ fontSize: '14px', fontWeight: 600, marginBottom: 4 }}>
                HIPAA-Ready Design
              </p>
              <p className="text-accent" style={{ fontSize: '13px', lineHeight: 1.6 }}>
                No real Protected Health Information (PHI) is stored in this demo. Your profile is
                saved locally on your device only. ClarityMD is designed with data privacy at its core.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full flex items-center justify-between rounded-2xl bg-card border border-border px-5 py-4 transition-all active:scale-[0.98]"
          >
            <span className="text-foreground" style={{ fontSize: '15px', fontWeight: 600 }}>
              Edit My Profile
            </span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-white px-5 py-4 transition-all active:scale-[0.98]"
          >
            <LogOut size={16} color="#EF4444" />
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#EF4444' }}>
              Reset Profile
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}