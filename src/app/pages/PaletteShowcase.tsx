import React, { useState } from 'react';
import { Globe, ArrowRight, Check, Mic, Pill, Home, User, X } from 'lucide-react';

interface Palette {
  id: string;
  name: string;
  tagline: string;
  mood: string[];
  bg: string;
  primary: string;
  accent: string;
  accentText: string;
  muted: string;
  subtle: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  waveColors: string[];
  swatches: { label: string; hex: string; textDark: boolean }[];
}

const PALETTES: Palette[] = [
  {
    id: 'sage-cream-original',
    name: 'Sage & Cream',
    tagline: 'The original · Balanced · Timeless',
    mood: ['Natural', 'Healing', 'Minimal'],
    bg: '#F8FAF4',
    primary: '#1F2E1F',
    accent: '#4E7C59',
    accentText: '#FFFFFF',
    muted: '#D8E8D4',
    subtle: 'rgba(31,46,31,0.05)',
    cardBg: '#ECF3E8',
    textPrimary: '#1F2E1F',
    textSecondary: 'rgba(31,46,31,0.48)',
    waveColors: ['#4E7C59', '#6A9873', '#87B48E', '#4E7C59'],
    swatches: [
      { label: 'Forest', hex: '#1F2E1F', textDark: false },
      { label: 'Cream', hex: '#F8FAF4', textDark: true },
      { label: 'Sage', hex: '#4E7C59', textDark: false },
      { label: 'Fern', hex: '#D8E8D4', textDark: true },
      { label: 'Mint Mist', hex: '#ECF3E8', textDark: true },
      { label: 'Moss', hex: '#2D4A2D', textDark: false },
    ],
  },
  {
    id: 'deep-forest-ivory',
    name: 'Deep Forest & Ivory',
    tagline: 'Lush · Rich · Grounded',
    mood: ['Deep', 'Lush', 'Confident'],
    bg: '#FAF9F5',
    primary: '#162A1C',
    accent: '#2E6B40',
    accentText: '#FFFFFF',
    muted: '#C8E0CE',
    subtle: 'rgba(22,42,28,0.06)',
    cardBg: '#E4F0E8',
    textPrimary: '#162A1C',
    textSecondary: 'rgba(22,42,28,0.46)',
    waveColors: ['#2E6B40', '#3D8652', '#54A168', '#2E6B40'],
    swatches: [
      { label: 'Deep Forest', hex: '#162A1C', textDark: false },
      { label: 'Ivory', hex: '#FAF9F5', textDark: true },
      { label: 'Emerald', hex: '#2E6B40', textDark: false },
      { label: 'Leaf', hex: '#C8E0CE', textDark: true },
      { label: 'Canopy', hex: '#E4F0E8', textDark: true },
      { label: 'Pine', hex: '#0E1E12', textDark: false },
    ],
  },
  {
    id: 'pale-sage-linen',
    name: 'Pale Sage & Linen',
    tagline: 'Airy · Soft · Restful',
    mood: ['Airy', 'Gentle', 'Restful'],
    bg: '#FAFAF7',
    primary: '#2C3A28',
    accent: '#8AAD84',
    accentText: '#FFFFFF',
    muted: '#DEE8DB',
    subtle: 'rgba(44,58,40,0.04)',
    cardBg: '#EFF4ED',
    textPrimary: '#2C3A28',
    textSecondary: 'rgba(44,58,40,0.44)',
    waveColors: ['#8AAD84', '#9EBD98', '#B3CEAF', '#8AAD84'],
    swatches: [
      { label: 'Thyme', hex: '#2C3A28', textDark: false },
      { label: 'Linen', hex: '#FAFAF7', textDark: true },
      { label: 'Pale Sage', hex: '#8AAD84', textDark: false },
      { label: 'Meadow', hex: '#DEE8DB', textDark: true },
      { label: 'Dew', hex: '#EFF4ED', textDark: true },
      { label: 'Herb', hex: '#5E7A58', textDark: false },
    ],
  },
  {
    id: 'eucalyptus-stone',
    name: 'Eucalyptus & Stone',
    tagline: 'Cool · Spa-like · Refined',
    mood: ['Cool', 'Spa', 'Refined'],
    bg: '#F5F8F6',
    primary: '#1E2C28',
    accent: '#4F8B7A',
    accentText: '#FFFFFF',
    muted: '#C8DED8',
    subtle: 'rgba(30,44,40,0.05)',
    cardBg: '#E0EDE9',
    textPrimary: '#1E2C28',
    textSecondary: 'rgba(30,44,40,0.44)',
    waveColors: ['#4F8B7A', '#66A092', '#80B5A6', '#4F8B7A'],
    swatches: [
      { label: 'Slate Green', hex: '#1E2C28', textDark: false },
      { label: 'Stone', hex: '#F5F8F6', textDark: true },
      { label: 'Eucalyptus', hex: '#4F8B7A', textDark: false },
      { label: 'Seafoam', hex: '#C8DED8', textDark: true },
      { label: 'Spa', hex: '#E0EDE9', textDark: true },
      { label: 'Teal Bark', hex: '#2E5E52', textDark: false },
    ],
  },
  {
    id: 'olive-parchment',
    name: 'Olive & Parchment',
    tagline: 'Warm · Earthy · Mediterranean',
    mood: ['Warm', 'Earthy', 'Organic'],
    bg: '#FAF8F0',
    primary: '#242214',
    accent: '#6B7A35',
    accentText: '#FFFFFF',
    muted: '#DEE4BF',
    subtle: 'rgba(36,34,20,0.05)',
    cardBg: '#EEF0DA',
    textPrimary: '#242214',
    textSecondary: 'rgba(36,34,20,0.46)',
    waveColors: ['#6B7A35', '#7D8E44', '#92A456', '#6B7A35'],
    swatches: [
      { label: 'Dark Olive', hex: '#242214', textDark: false },
      { label: 'Parchment', hex: '#FAF8F0', textDark: true },
      { label: 'Olive', hex: '#6B7A35', textDark: false },
      { label: 'Chaparral', hex: '#DEE4BF', textDark: true },
      { label: 'Wheat', hex: '#EEF0DA', textDark: true },
      { label: 'Dried Herb', hex: '#4A5220', textDark: false },
    ],
  },
  {
    id: 'juniper-mist',
    name: 'Juniper & Mist',
    tagline: 'Ethereal · Cool · Modern',
    mood: ['Ethereal', 'Cool', 'Modern'],
    bg: '#F4F8F7',
    primary: '#192828',
    accent: '#3D8B80',
    accentText: '#FFFFFF',
    muted: '#C4DDD9',
    subtle: 'rgba(25,40,40,0.05)',
    cardBg: '#DDF0EC',
    textPrimary: '#192828',
    textSecondary: 'rgba(25,40,40,0.45)',
    waveColors: ['#3D8B80', '#52A097', '#6AB5AC', '#3D8B80'],
    swatches: [
      { label: 'Juniper', hex: '#192828', textDark: false },
      { label: 'Mist', hex: '#F4F8F7', textDark: true },
      { label: 'Cyan Sage', hex: '#3D8B80', textDark: false },
      { label: 'Glacier', hex: '#C4DDD9', textDark: true },
      { label: 'Vapor', hex: '#DDF0EC', textDark: true },
      { label: 'Deep Cyan', hex: '#245950', textDark: false },
    ],
  },
];

function MiniWaveform({ colors, isAnimated }: { colors: string[]; isAnimated: boolean }) {
  const bars = [3,5,8,12,16,20,14,8,12,18,22,18,12,8,14,20,16,10,6,10,14,10,6,4,3];
  return (
    <div className="flex items-center justify-center gap-[2px] h-8">
      {bars.map((h, i) => {
        const colorIdx = i % colors.length;
        return (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: 2,
              height: isAnimated ? h + Math.sin(Date.now() / 200 + i) * 3 : h,
              backgroundColor: colors[colorIdx],
              opacity: 0.9,
              transition: 'height 0.2s ease',
            }}
          />
        );
      })}
    </div>
  );
}

function MiniNavBar({ palette }: { palette: Palette }) {
  return (
    <div
      className="flex justify-around items-center pt-2 pb-1 border-t"
      style={{ borderColor: palette.muted }}
    >
      {[
        { Icon: Home, label: 'Home' },
        { Icon: Mic, label: 'Session' },
        { Icon: Pill, label: 'Meds' },
        { Icon: User, label: 'Profile' },
      ].map(({ Icon, label }, i) => (
        <div key={label} className="flex flex-col items-center gap-0.5">
          <Icon
            size={13}
            style={{ color: i === 0 ? palette.accent : palette.textSecondary }}
            strokeWidth={i === 0 ? 2 : 1.5}
          />
          <span style={{ fontSize: 7, color: i === 0 ? palette.accent : palette.textSecondary, fontWeight: i === 0 ? 600 : 400 }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function PhoneMockup({ palette, hovered }: { palette: Palette; hovered: boolean }) {
  return (
    <div
      className="rounded-[28px] overflow-hidden shrink-0"
      style={{
        width: 148,
        minHeight: 272,
        backgroundColor: palette.bg,
        border: `1px solid ${palette.muted}`,
        boxShadow: hovered
          ? `0 20px 48px ${palette.primary}18, 0 4px 12px ${palette.primary}10`
          : `0 8px 24px ${palette.primary}10`,
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* Status bar */}
      <div className="flex justify-between items-center px-4 pt-3 pb-1">
        <span style={{ fontSize: 7, color: palette.textSecondary, fontWeight: 500 }}>9:41</span>
        <div className="flex gap-1 items-center">
          {[3, 4, 5].map((h, i) => (
            <div key={i} className="rounded-sm" style={{ width: 3, height: h, backgroundColor: palette.textSecondary, opacity: 0.5 }} />
          ))}
          <div className="ml-1 rounded-sm" style={{ width: 9, height: 4.5, border: `1px solid ${palette.textSecondary}`, opacity: 0.5, display: 'flex', alignItems: 'center', padding: '0 1px' }}>
            <div className="rounded-sm" style={{ width: 6, height: 3, backgroundColor: palette.accent }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center px-4 pt-3 pb-2">
        {/* Logo pill */}
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1 mb-3"
          style={{ backgroundColor: palette.primary }}
        >
          <Globe size={10} style={{ color: palette.bg }} strokeWidth={1.5} />
          <span style={{ fontSize: 9, color: palette.bg, fontWeight: 700, letterSpacing: '0.04em' }}>ClarityMD</span>
        </div>

        {/* Hero text */}
        <div style={{ fontSize: 13, fontWeight: 700, color: palette.textPrimary, textAlign: 'center', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
          Your health,<br/>your language.
        </div>
        <div style={{ fontSize: 7, color: palette.textSecondary, marginTop: 4, textAlign: 'center', lineHeight: 1.5 }}>
          Real-time medical translation
        </div>

        {/* Waveform card */}
        <div
          className="w-full rounded-xl mt-3 mb-2.5 px-2 py-2"
          style={{ backgroundColor: palette.cardBg, border: `1px solid ${palette.muted}` }}
        >
          <MiniWaveform colors={palette.waveColors} isAnimated={false} />
          <div className="flex items-center justify-center gap-1 mt-1">
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: palette.accent }} />
            <span style={{ fontSize: 6.5, color: palette.textSecondary }}>Live Translation Active</span>
          </div>
        </div>

        {/* Language row */}
        <div
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 w-full justify-center mb-2.5"
          style={{ backgroundColor: palette.subtle, border: `1px solid ${palette.muted}` }}
        >
          <span style={{ fontSize: 8 }}>🇲🇽</span>
          <span style={{ fontSize: 7.5, color: palette.textPrimary, fontWeight: 500 }}>Spanish</span>
          <ArrowRight size={8} style={{ color: palette.textSecondary }} />
          <span style={{ fontSize: 7.5, color: palette.textPrimary, fontWeight: 500 }}>English</span>
          <span style={{ fontSize: 8 }}>🇺🇸</span>
        </div>

        {/* CTA */}
        <button
          className="w-full flex items-center justify-center gap-1 rounded-xl"
          style={{
            backgroundColor: palette.accent,
            color: palette.accentText,
            height: 26,
            fontSize: 8.5,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          Get Started <ArrowRight size={8} />
        </button>

        <div style={{ fontSize: 6, color: palette.textSecondary, marginTop: 5, opacity: 0.7, textAlign: 'center' }}>
          Free for patients · No enrollment required
        </div>
      </div>

      <MiniNavBar palette={palette} />
    </div>
  );
}

function MoodTag({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="px-2 py-0.5 rounded-md text-[10px]"
      style={{ backgroundColor: color + '18', color: color, fontWeight: 600, letterSpacing: '0.02em' }}
    >
      {label}
    </span>
  );
}

function SwatchDot({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="rounded-full shadow-sm"
        style={{ width: 32, height: 32, backgroundColor: hex, border: '1.5px solid rgba(0,0,0,0.07)' }}
      />
      <span style={{ fontSize: 8.5, color: '#888', textAlign: 'center', lineHeight: 1.2, maxWidth: 36 }}>
        {label}
      </span>
    </div>
  );
}

export function PaletteShowcase() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const selectedPalette = PALETTES.find((p) => p.id === selected);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2F0EC',  }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(250,248,244,0.92)', borderColor: 'rgba(0,0,0,0.07)' }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ backgroundColor: '#1C1108' }}>
                <Globe size={13} style={{ color: '#FAF8F4' }} strokeWidth={1.5} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FAF8F4', letterSpacing: '-0.01em' }}>ClarityMD</span>
              </div>
              <span
                className="px-2 py-0.5 rounded-full"
                style={{ fontSize: 10.5, backgroundColor: '#E8E4DC', color: '#6B5E4A', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}
              >
                Palette Studio
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#999', marginTop: 4, letterSpacing: '0.01em' }}>
              6 minimalist modern options · click any card to select
            </p>
          </div>

          {selected && selectedPalette && (
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-opacity hover:opacity-70"
              style={{ backgroundColor: selectedPalette.subtle, borderColor: selectedPalette.muted }}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedPalette.accent }} />
              <span style={{ fontSize: 12, color: selectedPalette.textPrimary, fontWeight: 600 }}>
                {selectedPalette.name}
              </span>
              <X size={12} style={{ color: selectedPalette.textSecondary }} />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {PALETTES.map((palette) => {
            const isSelected = selected === palette.id;
            const isHovered = hoveredId === palette.id;

            return (
              <div
                key={palette.id}
                onClick={() => setSelected(isSelected ? null : palette.id)}
                onMouseEnter={() => setHoveredId(palette.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="rounded-2xl cursor-pointer overflow-hidden"
                style={{
                  border: isSelected
                    ? `2px solid ${palette.primary}`
                    : '2px solid rgba(0,0,0,0.06)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: isSelected
                    ? `0 12px 40px ${palette.primary}20, 0 2px 8px ${palette.primary}10`
                    : isHovered
                    ? '0 8px 28px rgba(0,0,0,0.10)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                  transform: isHovered && !isSelected ? 'translateY(-3px)' : 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                {/* Top accent bar — gradient from primary→accent */}
                <div
                  className="h-1"
                  style={{
                    background: `linear-gradient(to right, ${palette.primary}, ${palette.accent})`,
                  }}
                />

                <div className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.02em', lineHeight: 1 }}>
                          {palette.name}
                        </h3>
                        {isSelected && (
                          <div
                            className="flex items-center justify-center rounded-full"
                            style={{ width: 20, height: 20, backgroundColor: palette.primary, flexShrink: 0 }}
                          >
                            <Check size={11} color={palette.bg} strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: '#999', letterSpacing: '0.02em' }}>{palette.tagline}</p>
                    </div>
                  </div>

                  {/* Mood tags */}
                  <div className="flex gap-1.5 mb-4">
                    {palette.mood.map((m) => (
                      <MoodTag key={m} label={m} color={palette.accent} />
                    ))}
                  </div>

                  {/* Phone + info */}
                  <div className="flex gap-4 items-start">
                    <PhoneMockup palette={palette} hovered={isHovered} />

                    <div className="flex flex-col gap-4 flex-1 min-w-0">
                      {/* Swatches */}
                      <div>
                        <p style={{ fontSize: 9.5, fontWeight: 600, color: '#AAA', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          Colors
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {palette.swatches.map((s) => (
                            <SwatchDot key={s.label} hex={s.hex} label={s.label} />
                          ))}
                        </div>
                      </div>

                      {/* UI previews */}
                      <div>
                        <p style={{ fontSize: 9.5, fontWeight: 600, color: '#AAA', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          UI Preview
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {/* Primary btn */}
                          <div
                            className="flex items-center justify-center rounded-lg"
                            style={{ backgroundColor: palette.primary, height: 26, fontSize: 9.5, color: palette.bg, fontWeight: 600, letterSpacing: '0.02em' }}
                          >
                            Primary Action
                          </div>
                          {/* Accent btn */}
                          <div
                            className="flex items-center justify-center rounded-lg"
                            style={{ backgroundColor: palette.accent, height: 26, fontSize: 9.5, color: palette.accentText, fontWeight: 600, letterSpacing: '0.02em' }}
                          >
                            Accent / CTA
                          </div>
                          {/* Input */}
                          <div
                            className="rounded-lg px-3 flex items-center"
                            style={{ backgroundColor: palette.cardBg, height: 26, fontSize: 9.5, color: palette.textSecondary, border: `1px solid ${palette.muted}` }}
                          >
                            Search medications…
                          </div>
                          {/* Tags */}
                          <div className="flex gap-1 flex-wrap">
                            <span
                              className="px-2 py-0.5 rounded-md"
                              style={{ fontSize: 8.5, backgroundColor: palette.muted, color: palette.textPrimary, fontWeight: 500 }}
                            >
                              Spanish
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-md"
                              style={{ fontSize: 8.5, backgroundColor: palette.subtle, color: palette.accent, fontWeight: 600 }}
                            >
                              AI Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected detail panel */}
        {selected && selectedPalette && (
          <div
            className="mt-6 rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: selectedPalette.primary + '20',
              boxShadow: `0 4px 24px ${selectedPalette.primary}10`,
            }}
          >
            {/* Top bar */}
            <div
              className="h-1"
              style={{ background: `linear-gradient(to right, ${selectedPalette.primary}, ${selectedPalette.accent})` }}
            />

            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {selectedPalette.name}
                  </h2>
                  <p style={{ fontSize: 12, color: '#999', marginTop: 4, letterSpacing: '0.02em' }}>{selectedPalette.tagline}</p>
                </div>
                <div className="flex gap-1.5">
                  {selectedPalette.mood.map((m) => (
                    <MoodTag key={m} label={m} color={selectedPalette.accent} />
                  ))}
                </div>
              </div>

              {/* Large swatches */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
                {selectedPalette.swatches.map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-xl"
                      style={{ backgroundColor: s.hex, height: 52, border: '1.5px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    />
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: '#444', textAlign: 'center' }}>{s.label}</span>
                    <span style={{ fontSize: 9.5, fontFamily: 'monospace', color: '#AAA' }}>{s.hex}</span>
                  </div>
                ))}
              </div>

              {/* Token pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Background', hex: selectedPalette.bg },
                  { label: 'Primary', hex: selectedPalette.primary },
                  { label: 'Accent', hex: selectedPalette.accent },
                  { label: 'Muted', hex: selectedPalette.muted },
                  { label: 'Card', hex: selectedPalette.cardBg },
                ].map((token) => (
                  <div
                    key={token.label}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                    style={{ backgroundColor: selectedPalette.subtle, borderColor: selectedPalette.muted }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: token.hex, border: '1px solid rgba(0,0,0,0.1)' }} />
                    <span style={{ fontSize: 11, color: selectedPalette.textSecondary }}>{token.label}:</span>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: selectedPalette.textPrimary, fontWeight: 600 }}>{token.hex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <p className="text-center mt-6" style={{ fontSize: 11, color: '#BBB', letterSpacing: '0.04em' }}>
          Click any card to select · All palettes designed for WCAG AA accessibility
        </p>
      </div>
    </div>
  );
}