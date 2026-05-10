import React, { useState } from 'react';
import {
  Search,
  Volume2,
  AlertTriangle,
  Clock,
  CheckCircle,
  Pill,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { WaveformVisualizer } from '../components/WaveformVisualizer';
import { useProfile } from '../context/ProfileContext';

interface MedInfo {
  name: string;
  genericName?: string;
  whatItDoes: string;
  howToTake: string;
  normalSideEffects: string[];
  warningSideEffects: string[];
  timing: string;
}

const MOCK_MEDS: Record<string, MedInfo> = {
  metformin: {
    name: 'Metformin',
    genericName: 'Metformin HCl',
    whatItDoes:
      'Metformin ayuda a controlar el azúcar en su sangre. Funciona diciéndole a su hígado que no produzca tanto azúcar y ayuda a su cuerpo a usar la insulina mejor. Es el medicamento más recetado para la diabetes tipo 2.',
    howToTake:
      'Tome Metformin con sus comidas — con el desayuno y la cena. Esto ayuda a reducir el malestar del estómago. Tome la tableta entera con un vaso de agua. No corte ni mastique la tableta.',
    timing: 'Con desayuno y cena, cada día',
    normalSideEffects: [
      'Náuseas o malestar estomacal (especialmente al principio)',
      'Diarrea o heces blandas',
      'Sabor metálico en la boca',
      'Pérdida de apetito',
    ],
    warningSideEffects: [
      'Dolor muscular inusual o debilidad',
      'Dificultad para respirar',
      'Dolor de estómago fuerte',
      'Sensación de frío o mareos intensos',
    ],
  },
  lisinopril: {
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    whatItDoes:
      'Lisinopril ayuda a relajar sus vasos sanguíneos para que su corazón no tenga que trabajar tan duro. Esto baja su presión arterial y protege su corazón y riñones.',
    howToTake:
      'Tome Lisinopril una vez al día, generalmente por la mañana. Puede tomarlo con o sin comida. Trate de tomarlo a la misma hora cada día.',
    timing: 'Una vez al día, por la mañana',
    normalSideEffects: [
      'Tos seca (muy común — hasta 1 de cada 5 personas)',
      'Mareos al levantarse rápidamente',
      'Cansancio o fatiga',
      'Dolor de cabeza leve',
    ],
    warningSideEffects: [
      'Hinchazón en la cara, labios, lengua o garganta',
      'Dificultad para tragar o respirar',
      'Desmayos',
      'Potasio muy alto (confusión, debilidad)',
    ],
  },
  amoxicillin: {
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    whatItDoes:
      'Amoxicillin es un antibiótico que mata las bacterias que causan infecciones. Se usa para infecciones de oído, garganta, vías urinarias, y otras infecciones comunes. No funciona para infecciones de virus como el resfriado o la gripe.',
    howToTake:
      'Tome Amoxicillin exactamente como su doctor le dijo — generalmente 2 o 3 veces al día. Es muy importante terminar todo el tratamiento, aunque se sienta mejor antes de terminarlo. Si para antes de tiempo, la infección puede regresar.',
    timing: '2–3 veces al día, complete el ciclo completo',
    normalSideEffects: [
      'Diarrea',
      'Náuseas o malestar del estómago',
      'Vómitos (tómelo con comida si esto ocurre)',
      'Sarpullido leve',
    ],
    warningSideEffects: [
      'Sarpullido severo, urticaria o picazón intensa',
      'Dificultad para respirar o tragar',
      'Hinchazón de cara o garganta',
      'Diarrea con sangre',
    ],
  },
};

const SUGGESTIONS = ['Metformin', 'Lisinopril', 'Amoxicillin'];

function Section({
  icon: Icon,
  title,
  color,
  bgColor,
  children,
}: {
  icon: any;
  title: string;
  color: string;
  bgColor: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-4"
        style={{ backgroundColor: bgColor }}
      >
        <Icon size={18} color={color} className="shrink-0" />
        <span className="text-foreground" style={{ fontSize: '15px', fontWeight: 700, flex: 1, textAlign: 'left' }}>
          {title}
        </span>
        {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 bg-card">{children}</div>}
    </div>
  );
}

export function Medication() {
  const { profile } = useProfile();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<MedInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const language = profile?.language ?? 'Spanish';

  const handleSearch = (input?: string) => {
    const q = (input ?? query).trim().toLowerCase();
    if (!q) return;

    setLoading(true);
    setNotFound(false);
    setResult(null);
    setIsPlaying(false);

    setTimeout(() => {
      const found = MOCK_MEDS[q];
      if (found) {
        setResult(found);
      } else {
        // Try partial match
        const key = Object.keys(MOCK_MEDS).find((k) => k.startsWith(q) || q.startsWith(k));
        if (key) {
          setResult(MOCK_MEDS[key]);
        } else {
          setNotFound(true);
        }
      }
      setLoading(false);
    }, 1200);
  };

  const handlePlayback = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 5000);
  };

  return (
    <div
      className="min-h-full pb-4 bg-background"
      style={{}}
    >
      {/* Header */}
      <div
        className="px-4 pt-5 pb-5 bg-primary"
      >
        <h1 className="text-primary-foreground mb-1" style={{ fontSize: '22px', fontWeight: 700 }}>
          Medication Explainer
        </h1>
        <p className="text-primary-foreground" style={{ fontSize: '14px', opacity: 0.75 }}>
          Adapted in {language} · Culturally adjusted
        </p>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Search input */}
        <div
          className="flex items-center gap-3 rounded-2xl bg-card border-2 border-border px-4 focus-within:border-accent transition-colors"
          style={{ height: 56 }}
        >
          <Search size={20} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Type a medication name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-transparent focus:outline-none text-foreground"
            style={{ fontSize: '16px' }}
          />
          {query && (
            <button
              onClick={() => handleSearch()}
              className="px-3 py-1.5 rounded-xl transition-all active:scale-95 bg-accent text-accent-foreground"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              Search
            </button>
          )}
        </div>

        {/* Quick suggestions */}
        {!result && !loading && (
          <div>
            <p className="text-muted-foreground" style={{ fontSize: '13px', marginBottom: 8 }}>Quick lookup:</p>
            <div className="flex gap-2 flex-wrap">
              {SUGGESTIONS.map((s, index) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    handleSearch(s.toLowerCase());
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-muted px-3 py-1.5 transition-all active:scale-95 text-accent"
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    backgroundColor: index % 2 === 0 ? '#E8F3EF' : '#FFFFFF'
                  }}
                >
                  <Pill size={13} />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            className="rounded-2xl p-6 flex flex-col items-center gap-3 bg-muted border border-border"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-accent"
                  style={{
                    animation: `bounce 0.8s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
            <p className="text-accent" style={{ fontSize: '14px', fontWeight: 500 }}>
              Looking up medication · Adapting for {language}...
            </p>
          </div>
        )}

        {/* Not found */}
        {notFound && (
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#E8F3EF', border: '1px solid #C7DDD5' }}
          >
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>
              Medication not found
            </p>
            <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
              We couldn't find "{query}" in our database. Try the exact medication name, or ask your
              pharmacist for a printed information sheet.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--accent)', marginTop: 8 }}>
              Try: Metformin, Lisinopril, or Amoxicillin
            </p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="flex flex-col gap-3">
            {/* Medication header */}
            <div
              className="rounded-2xl p-4 bg-accent"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-accent-foreground" style={{ fontSize: '22px', fontWeight: 700 }}>
                    {result.name}
                  </h2>
                  {result.genericName && (
                    <p className="text-accent-foreground" style={{ fontSize: '13px', opacity: 0.7 }}>
                      {result.genericName}
                    </p>
                  )}
                  <div
                    className="inline-flex items-center gap-1.5 mt-2 rounded-full px-3 py-1"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <Clock size={12} className="text-accent-foreground" style={{ opacity: 0.85 }} />
                    <span className="text-accent-foreground" style={{ fontSize: '12px', opacity: 0.85, fontWeight: 500 }}>
                      {result.timing}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handlePlayback}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all active:scale-95"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  {isPlaying ? (
                    <WaveformVisualizer isActive={true} color="white" size="sm" />
                  ) : (
                    <>
                      <Volume2 size={16} className="text-accent-foreground" />
                      <span className="text-accent-foreground" style={{ fontSize: '13px', fontWeight: 600 }}>
                        Play
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Language badge */}
            <div
              className="rounded-xl p-3 flex items-center gap-2 bg-muted border border-border"
            >
              <CheckCircle size={16} className="text-accent" />
              <p className="text-accent" style={{ fontSize: '13px' }}>
                Adapted in <strong>{language}</strong> based on your cultural profile
              </p>
            </div>

            {/* What it does */}
            <Section icon={Pill} title="What this medication does" color="var(--accent)" bgColor="var(--muted)">
              <p className="text-foreground" style={{ fontSize: '16px', lineHeight: 1.7, paddingTop: 8 }}>
                {result.whatItDoes}
              </p>
            </Section>

            {/* How to take */}
            <Section icon={Clock} title="How and when to take it" color="var(--accent)" bgColor="var(--muted)">
              <p className="text-foreground" style={{ fontSize: '16px', lineHeight: 1.7, paddingTop: 8 }}>
                {result.howToTake}
              </p>
            </Section>

            {/* Normal side effects */}
            <Section
              icon={CheckCircle}
              title="Common side effects (usually not dangerous)"
              color="#F5C842"
              bgColor="#E8F3EF"
            >
              <ul className="flex flex-col gap-2 pt-2">
                {result.normalSideEffects.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle size={16} style={{ color: '#F5C842', flexShrink: 0, marginTop: '3px' }} />
                    <span style={{ fontSize: '15px', color: '#1E293B', lineHeight: 1.6 }}>{s}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Warning side effects */}
            <Section
              icon={AlertTriangle}
              title="Call your doctor if you notice..."
              color="#E53935"
              bgColor="#E8F3EF"
            >
              <ul className="flex flex-col gap-2 pt-2">
                {result.warningSideEffects.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle size={16} style={{ color: '#E53935', flexShrink: 0, marginTop: '3px' }} />
                    <span style={{ fontSize: '15px', color: '#1E293B', lineHeight: 1.6 }}>{s}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Disclaimer */}
            <div
              className="rounded-xl p-3 bg-card border border-border"
            >
              <p className="text-muted-foreground" style={{ fontSize: '12px', lineHeight: 1.5 }}>
                This information is provided by ClarityMD AI and is not medical advice. Always
                follow your doctor's or pharmacist's specific instructions for your situation.
              </p>
            </div>
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