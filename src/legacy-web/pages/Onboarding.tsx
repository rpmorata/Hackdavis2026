import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, Check, ChevronDown, Search, X } from 'lucide-react';
import { useProfile, PatientProfile } from '../context/ProfileContext';

const TOTAL_STEPS = 3;

const LANGUAGES = [
  'Afrikaans',
  'Albanian',
  'Amharic',
  'Arabic',
  'Armenian',
  'Assamese',
  'Azerbaijani',
  'Basque',
  'Belarusian',
  'Bengali',
  'Bosnian',
  'Bulgarian',
  'Catalan',
  'Chinese (Simplified)',
  'Chinese (Traditional)',
  'Chinese (Hong Kong)',
  'Croatian',
  'Czech',
  'Danish',
  'Dutch',
  'English',
  'Estonian',
  'Farsi',
  'Filipino',
  'Finnish',
  'French',
  'Galician',
  'Georgian',
  'German',
  'Greek',
  'Gujarati',
  'Hebrew',
  'Hindi',
  'Hungarian',
  'Icelandic',
  'Indonesian',
  'Italian',
  'Japanese',
  'Kannada',
  'Kazakh',
  'Khmer',
  'Korean',
  'Lao',
  'Latvian',
  'Lithuanian',
  'Macedonian',
  'Malay',
  'Malayalam',
  'Marathi',
  'Mongolian',
  'Nepali',
  'Norwegian',
  'Odia',
  'Polish',
  'Portuguese',
  'Punjabi',
  'Romanian',
  'Russian',
  'Serbian',
  'Slovak',
  'Slovenian',
  'Spanish',
  'Swahili',
  'Swedish',
  'Tamil',
  'Telugu',
  'Thai',
  'Turkish',
  'Ukrainian',
  'Urdu',
  'Uzbek',
  'Vietnamese',
  'Zulu',
];

const COUNTRIES = [
  'Mexico', 'China', 'Vietnam', 'Philippines', 'El Salvador',
  'Guatemala', 'India', 'Cuba', 'Dominican Republic', 'Honduras',
  'South Korea', 'Brazil', 'Other',
];

const RELIGIONS = [
  'Catholic', 'Christian', 'Islam', 'Judaism',
  'Buddhism', 'Hinduism', 'Folk / Traditional', 'None', 'Prefer not to say',
];

type Draft = Partial<PatientProfile>;

interface StepProps {
  draft: Draft;
  update: (u: Partial<PatientProfile>) => void;
}

function OptionButton({
  label,
  selected,
  onClick,
  description,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  description?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border-2 px-4 py-3 transition-all active:scale-[0.98]"
      style={{
        borderColor: selected ? 'var(--accent)' : '#E2E8F0',
        backgroundColor: selected ? '#E0EDE9' : '#FFFFFF',
        color: selected ? '#334155' : '#334155',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p style={{ fontSize: '15px', fontWeight: selected ? 600 : 400 }}>{label}</p>
          {description && (
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: 2 }}>{description}</p>
          )}
        </div>
        {selected && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Check size={14} color="white" />
          </div>
        )}
      </div>
    </button>
  );
}

function LanguageDropdown({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (lang: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = LANGUAGES.filter((l) =>
    l.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-xl border-2 px-4 bg-card transition-all"
        style={{
          height: 52,
          borderColor: open ? 'var(--accent)' : value ? 'var(--accent)' : '#E2E8F0',
          backgroundColor: value ? '#E0EDE9' : '#FFFFFF',
        }}
      >
        <span
          style={{
            fontSize: '16px',
            color: value ? '#334155' : 'var(--muted-foreground)',
            fontWeight: value ? 600 : 400,
          }}
        >
          {value ?? 'Select a language…'}
        </span>
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setOpen(false);
              }}
              className="w-5 h-5 flex items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <X size={11} color="white" />
            </button>
          )}
          <ChevronDown
            size={18}
            color="var(--muted-foreground)"
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </div>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden"
          style={{ maxHeight: 320 }}
        >
          {/* Search */}
          <div className="p-2 border-b border-border flex items-center gap-2 bg-slate-50">
            <Search size={15} color="var(--muted-foreground)" className="shrink-0 ml-1" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search languages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none"
              style={{ fontSize: '15px', color: 'var(--foreground)' }}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')}>
                <X size={14} color="var(--muted-foreground)" />
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
            {filtered.length === 0 ? (
              <div className="px-4 py-3" style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>
                No languages found
              </div>
            ) : (
              filtered.map((lang) => {
                const isSelected = value === lang;
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      onChange(lang);
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 transition-colors text-left"
                    style={{
                      backgroundColor: isSelected ? '#E0EDE9' : 'transparent',
                      color: isSelected ? '#334155' : '#334155',
                      fontSize: '15px',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <span>{lang}</span>
                    {isSelected && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--accent)' }}
                      >
                        <Check size={12} color="white" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Step1Language({ draft, update }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block mb-2" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
          What is your name? <span style={{ color: 'var(--accent)' }}>*</span>
        </label>
        <input
          type="text"
          placeholder="First name only"
          value={draft.name ?? ''}
          onChange={(e) => update({ name: e.target.value })}
          className="w-full rounded-xl border-2 border-border px-4 bg-card focus:outline-none focus:border-accent transition-colors"
          style={{ height: 52, fontSize: '16px' }}
        />
      </div>

      <div>
        <label className="block mb-2" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
          Preferred language for medical information <span style={{ color: 'var(--accent)' }}>*</span>
        </label>
        <LanguageDropdown
          value={draft.language}
          onChange={(lang) => update({ language: lang })}
        />
      </div>

      <div>
        <label className="block mb-2" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
          How well can you read in your language? <span style={{ color: 'var(--accent)' }}>*</span>
        </label>
        <div className="flex flex-col gap-2">
          <OptionButton
            label="I read fluently"
            description="I am comfortable reading documents"
            selected={draft.healthLiteracy === 'fluent'}
            onClick={() => update({ healthLiteracy: 'fluent' })}
          />
          <OptionButton
            label="I read some"
            description="I understand simple words and sentences"
            selected={draft.healthLiteracy === 'some'}
            onClick={() => update({ healthLiteracy: 'some' })}
          />
          <OptionButton
            label="I prefer audio"
            description="Please read everything out loud to me"
            selected={draft.healthLiteracy === 'audio'}
            onClick={() => update({ healthLiteracy: 'audio' })}
          />
        </div>
      </div>

      <div>
        <label className="block mb-2" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
          Medical terms — what level do you prefer? <span style={{ color: 'var(--accent)' }}>*</span>
        </label>
        <div className="flex flex-col gap-2">
          <OptionButton
            label="Use medical words"
            description="I understand clinical terminology"
            selected={draft.medicalTerminology === 'clinical'}
            onClick={() => update({ medicalTerminology: 'clinical' })}
          />
          <OptionButton
            label="Plain everyday language"
            description="Explain things simply, like to a friend"
            selected={draft.medicalTerminology === 'plain'}
            onClick={() => update({ medicalTerminology: 'plain' })}
          />
          <OptionButton
            label="Very simple words"
            description="Use easy words, short sentences, examples"
            selected={draft.medicalTerminology === 'simple'}
            onClick={() => update({ medicalTerminology: 'simple' })}
          />
        </div>
      </div>
    </div>
  );
}

function Step2Culture({ draft, update }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block mb-2" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
          Country of origin or cultural background <span style={{ color: 'var(--accent)' }}>*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {COUNTRIES.map((c) => (
            <OptionButton
              key={c}
              label={c}
              selected={draft.culturalBackground === c}
              onClick={() => update({ culturalBackground: c })}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-2" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
          How long have you been in the United States?{' '}
          <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(optional)</span>
        </label>
        <div className="flex flex-col gap-2">
          {[
            { value: 'recent', label: 'Less than 1 year', desc: 'Recent arrival' },
            { value: '1-5', label: '1 – 5 years' },
            { value: '5+', label: '5+ years' },
            { value: 'born', label: 'Born in the US' },
          ].map(({ value, label, desc }) => (
            <OptionButton
              key={value}
              label={label}
              description={desc}
              selected={draft.timeInUS === value}
              onClick={() => update({ timeInUS: value })}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-2" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
          Experience with Western medicine{' '}
          <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(optional)</span>
        </label>
        <div className="flex flex-col gap-2">
          {[
            { value: 'comfortable', label: 'Comfortable', desc: 'I have used it for many years' },
            { value: 'some', label: 'Some experience', desc: 'I know the basics' },
            { value: 'traditional', label: 'Traditional medicine background', desc: 'I grew up with herbal or traditional remedies' },
          ].map(({ value, label, desc }) => (
            <OptionButton
              key={value}
              label={label}
              description={desc}
              selected={draft.westernMedicineFamiliarity === value}
              onClick={() => update({ westernMedicineFamiliarity: value })}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-2" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
          Religious affiliation{' '}
          <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(optional — helps us adapt sensitive topics)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {RELIGIONS.map((r) => (
            <OptionButton
              key={r}
              label={r}
              selected={draft.religion === r}
              onClick={() => update({ religion: r })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3Family({ draft, update }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block mb-2" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
          Who makes medical decisions for you? <span style={{ color: 'var(--accent)' }}>*</span>
        </label>
        <div className="flex flex-col gap-2">
          <OptionButton
            label="I decide for myself"
            selected={draft.decisionMaker === 'myself'}
            onClick={() => update({ decisionMaker: 'myself', familyMode: false })}
          />
          <OptionButton
            label="I decide with family"
            description="I discuss decisions with family members"
            selected={draft.decisionMaker === 'shared'}
            onClick={() => update({ decisionMaker: 'shared' })}
          />
          <OptionButton
            label="Family decides"
            description="A family member is my primary decision-maker"
            selected={draft.decisionMaker === 'family'}
            onClick={() => update({ decisionMaker: 'family' })}
          />
        </div>
      </div>

      {(draft.decisionMaker === 'shared' || draft.decisionMaker === 'family') && (
        <div>
          <label className="block mb-2" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
            Family spokesperson name{' '}
            <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g., my husband José"
            value={draft.familyName ?? ''}
            onChange={(e) => update({ familyName: e.target.value })}
            className="w-full rounded-xl border-2 border-border px-4 bg-card focus:outline-none focus:border-accent transition-colors"
            style={{ height: 52, fontSize: '16px' }}
          />
        </div>
      )}

      <div>
        <label className="block mb-2" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
          Healthcare trust level{' '}
          <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(optional)</span>
        </label>
        <div className="flex flex-col gap-2">
          {[
            { value: 'positive', label: 'Positive', desc: 'I generally trust the healthcare system' },
            { value: 'mixed', label: 'Mixed', desc: 'I have had both good and bad experiences' },
            { value: 'negative', label: 'Some distrust', desc: 'I have concerns or bad past experiences' },
          ].map(({ value, label, desc }) => (
            <OptionButton
              key={value}
              label={label}
              description={desc}
              selected={draft.medicalTrust === value}
              onClick={() => update({ medicalTrust: value })}
            />
          ))}
          <OptionButton
            label="Prefer not to say"
            selected={draft.medicalTrust === 'prefer-not'}
            onClick={() => update({ medicalTrust: 'prefer-not' })}
          />
        </div>
      </div>
    </div>
  );
}


const STEP_TITLES = [
  'Language & Literacy',
  'Cultural Background',
  'Family & Decisions',
];

const STEP_SUBTITLES = [
  'Help us communicate in the right language, at the right level for you.',
  'Tell us about your background so we can adapt how information is shared.',
  'Help us understand how medical decisions work in your family.',
];

export function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile } = useProfile();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>({
    language: 'Spanish',
    healthLiteracy: 'fluent',
    medicalTerminology: 'plain',
    decisionMaker: 'myself',
    familyMode: false,
    communicationTone: 'warm',
  });

  const update = (u: Partial<PatientProfile>) => setDraft((d) => ({ ...d, ...u }));

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    updateProfile({ ...(draft as PatientProfile), onboardingComplete: true });
    navigate('/home');
  };

  const isStep1Valid = !!draft.name && !!draft.language && !!draft.healthLiteracy && !!draft.medicalTerminology;
  const isStep2Valid = !!draft.culturalBackground;
  const isStep3Valid = !!draft.decisionMaker;

  const isValid = [isStep1Valid, isStep2Valid, isStep3Valid][step - 1];

  return (
    <div
      className="min-h-screen flex flex-col max-w-[480px] mx-auto bg-background"
    >
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-4 pb-4">
        <div className="flex items-center gap-3 mb-4">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-card"
            >
              <ChevronLeft size={18} color="#475569" />
            </button>
          )}
          <div className="flex-1">
            <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontWeight: 500 }}>
              Step {step} of {TOTAL_STEPS}
            </p>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--foreground)' }}>
              {STEP_TITLES[step - 1]}
            </h2>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%`, backgroundColor: 'var(--accent)' }}
          />
        </div>
      </div>

      {/* Step subtitle */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
          {STEP_SUBTITLES[step - 1]}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {step === 1 && <Step1Language draft={draft} update={update} />}
        {step === 2 && <Step2Culture draft={draft} update={update} />}
        {step === 3 && <Step3Family draft={draft} update={update} />}
      </div>

      {/* Footer */}
      <div className="bg-card border-t border-border p-4">
        {step === 2 && (
          <button
            onClick={handleNext}
            className="w-full text-center mb-2"
            style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}
          >
            Skip optional fields
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!isValid}
          className="w-full flex items-center justify-center gap-2 rounded-2xl text-white transition-all active:scale-95"
          style={{
            backgroundColor: isValid ? 'var(--accent)' : '#CBD5E1',
            height: 56,
            fontSize: '17px',
            fontWeight: 700,
          }}
        >
          {step === TOTAL_STEPS ? (
            <>
              <Check size={20} />
              Complete Setup
            </>
          ) : (
            <>
              Continue
              <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}