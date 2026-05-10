import { MaterialIcons } from '@expo/vector-icons';
import { createAudioPlayer } from 'expo-audio';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Body, Screen } from '../components/ui';
import { useProfile } from '../context/ProfileContext';
import { releaseAudioUri } from '../services/audio';
import { askMedication, ENGLISH_SECTION_TITLES, MedicationInfo } from '../services/backboard';
import { synthesize } from '../services/elevenlabs';
import { colors, typography } from '../theme';

const SUGGESTIONS = ['lisinopril', 'metformin', 'amoxicillin', 'atorvastatin', 'metoprolol'];

type Stage = 'idle' | 'loading' | 'speaking';
type SectionKey = 'use' | 'how' | 'sideEffects' | 'warning';

const TAB_BAR_CLEARANCE = 60;

export function MedicationScreen() {
  const { profile } = useProfile();
  const language = profile?.language ?? 'English';

  const [query, setQuery] = useState('');
  const [info, setInfo] = useState<MedicationInfo | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    use: true,
    how: true,
    sideEffects: true,
    warning: true,
  });
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  function showError(err: unknown) {
    setError(err instanceof Error ? err.message : String(err));
    setStage('idle');
  }

  function toggleSection(key: SectionKey) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function lookup(rawQuery?: string) {
    const q = (rawQuery ?? query).trim();
    if (!q) {
      setError('Enter a medication name first.');
      return;
    }
    setError(null);
    setStage('loading');
    setInfo(null);
    releaseAudioUri(audioUri);
    setAudioUri(null);
    try {
      const result = await askMedication(q, profile);
      setInfo(result);
      setStage('idle');
    } catch (err) {
      showError(err);
    }
  }

  async function speak() {
    if (!info || info.unknown) return;
    setError(null);
    setStage('speaking');
    try {
      const sideEffects = info.sideEffects.length
        ? `Possible side effects: ${info.sideEffects.join(', ')}.`
        : '';
      const text = [info.use, info.how, sideEffects, info.warning].filter(Boolean).join(' ');
      const uri = await synthesize(text);
      releaseAudioUri(audioUri);
      setAudioUri(uri);
      try {
        playerRef.current?.release?.();
      } catch {}
      const player = createAudioPlayer({ uri });
      playerRef.current = player;
      player.play();
      setStage('idle');
    } catch (err) {
      showError(err);
    }
  }

  function pickSuggestion(name: string) {
    setQuery(name);
    void lookup(name);
  }

  const showResult = info && !info.unknown;
  const showUnknown = info && info.unknown;
  const showEmptyHint = !info && !error && stage === 'idle';

  return (
    <Screen padded={false}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Medication Explainer</Text>
          <Text style={styles.headerSubtitle}>
            Adapted in {language} · Culturally adjusted
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.searchRow}>
            <MaterialIcons name="search" size={20} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search medication"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => lookup()}
              editable={stage !== 'loading'}
              style={styles.searchInput}
            />
            <Pressable
              onPress={() => lookup()}
              disabled={stage !== 'idle'}
              style={({ pressed }) => [
                styles.searchButton,
                stage !== 'idle' && styles.searchButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.searchButtonText}>
                {stage === 'loading' ? '…' : 'Search'}
              </Text>
            </Pressable>
          </View>

          {!showResult ? (
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((name) => (
                <Pressable
                  key={name}
                  onPress={() => pickSuggestion(name)}
                  disabled={stage === 'loading'}
                  style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                >
                  <Text style={styles.chipText}>{name}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error-outline" size={16} color={colors.danger} />
              <Body style={{ color: colors.danger, flex: 1 }}>{error}</Body>
            </View>
          ) : null}

          {stage === 'loading' ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>
                Asking OpenBioLLM about {query}…
              </Text>
            </View>
          ) : null}

          {showUnknown ? (
            <View style={styles.unknownCard}>
              <MaterialIcons name="search-off" size={32} color={colors.textMuted} />
              <Text style={styles.unknownTitle}>No reliable information</Text>
              <Text style={styles.unknownBody}>
                The model could not confirm "{query}" as a medication it has reliable information for.
              </Text>
            </View>
          ) : null}

          {showResult ? (
            <>
              <SummaryCard
                info={info!}
                stage={stage}
                hasAudio={!!audioUri}
                onPlay={speak}
              />

              <View style={styles.adaptedBadge}>
                <MaterialIcons name="check-circle-outline" size={16} color={colors.primary} />
                <Text style={styles.adaptedText}>
                  Adapted in <Text style={styles.adaptedEmphasis}>{language}</Text> based on your cultural profile
                </Text>
              </View>

              {(() => {
                const titles = info!.sectionTitles ?? ENGLISH_SECTION_TITLES;
                return (
                  <>
                    {info!.use ? (
                      <Section
                        icon="medication"
                        title={titles.use}
                        isOpen={expanded.use}
                        onToggle={() => toggleSection('use')}
                      >
                        <Text style={styles.sectionBody}>{info!.use}</Text>
                      </Section>
                    ) : null}

                    {info!.how ? (
                      <Section
                        icon="schedule"
                        title={titles.how}
                        isOpen={expanded.how}
                        onToggle={() => toggleSection('how')}
                      >
                        <Text style={styles.sectionBody}>{info!.how}</Text>
                      </Section>
                    ) : null}

                    {info!.sideEffects.length ? (
                      <Section
                        icon="check-circle-outline"
                        title={titles.sideEffects}
                        isOpen={expanded.sideEffects}
                        onToggle={() => toggleSection('sideEffects')}
                      >
                        {info!.sideEffects.map((item, i) => (
                          <View key={`${item}-${i}`} style={styles.bulletRow}>
                            <MaterialIcons name="warning-amber" size={16} color={colors.warning} />
                            <Text style={styles.bulletText}>{item}</Text>
                          </View>
                        ))}
                      </Section>
                    ) : null}

                    {info!.warning ? (
                      <Section
                        icon="warning-amber"
                        title={titles.warning}
                        iconColor={colors.danger}
                        isOpen={expanded.warning}
                        onToggle={() => toggleSection('warning')}
                      >
                        <View style={styles.bulletRow}>
                          <MaterialIcons name="warning-amber" size={16} color={colors.danger} />
                          <Text style={styles.bulletText}>{info!.warning}</Text>
                        </View>
                      </Section>
                    ) : null}
                  </>
                );
              })()}

              <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>
                  This information is provided by ClarityMD AI and is not medical advice. Always follow your doctor's or pharmacist's specific instructions for your situation.
                </Text>
              </View>
            </>
          ) : null}

          {showEmptyHint ? (
            <View style={styles.emptyCard}>
              <MaterialIcons name="medication" size={32} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Look up any medication</Text>
              <Text style={styles.emptyBody}>
                Type a name above or tap a suggestion to get plain-language info from OpenBioLLM.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Screen>
  );
}

function SummaryCard({
  info,
  stage,
  hasAudio,
  onPlay,
}: {
  info: MedicationInfo;
  stage: Stage;
  hasAudio: boolean;
  onPlay: () => void;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryName}>{titleCase(info.name)}</Text>
          {info.description ? (
            <Text style={styles.summaryDescription}>{info.description}</Text>
          ) : null}
        </View>
        <Pressable
          onPress={onPlay}
          disabled={stage !== 'idle'}
          accessibilityLabel="Play explanation"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.playButton,
            stage !== 'idle' && styles.playButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          {stage === 'speaking' ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons
                name={hasAudio ? 'replay' : 'volume-up'}
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.playButtonText}>Play</Text>
            </>
          )}
        </Pressable>
      </View>
      {info.schedule ? (
        <View style={styles.schedulePill}>
          <MaterialIcons name="schedule" size={14} color="#FFFFFF" />
          <Text style={styles.scheduleText}>{info.schedule}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Section({
  icon,
  iconColor,
  title,
  isOpen,
  onToggle,
  children,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <Pressable onPress={onToggle} style={styles.sectionHeader}>
        <MaterialIcons name={icon} size={20} color={iconColor ?? colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <MaterialIcons
          name={isOpen ? 'expand-less' : 'expand-more'}
          size={22}
          color={colors.textMuted}
        />
      </Pressable>
      {isOpen ? <View style={styles.sectionBodyWrap}>{children}</View> : null}
    </View>
  );
}

function titleCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  header: {
    backgroundColor: colors.primary,
    gap: 6,
    paddingBottom: 18,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 26,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: typography.regular,
    fontSize: 14,
  },
  scroll: {
    gap: 14,
    padding: 18,
    paddingBottom: 40,
  },

  // Search bar
  searchRow: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.regular,
    fontSize: 16,
    minHeight: 40,
    paddingVertical: 6,
  },
  searchButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 14,
  },

  // Suggestions
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    color: colors.primary,
    fontFamily: typography.bold,
    fontSize: 14,
  },

  // States
  errorBanner: {
    alignItems: 'flex-start',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  loadingText: {
    color: colors.textMuted,
    flex: 1,
    fontFamily: typography.regular,
    fontSize: 14,
  },
  unknownCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 22,
  },
  unknownTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 16,
    marginTop: 6,
  },
  unknownBody: {
    color: colors.textMuted,
    fontFamily: typography.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginTop: 8,
    padding: 24,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 17,
    marginTop: 6,
  },
  emptyBody: {
    color: colors.textMuted,
    fontFamily: typography.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },

  // Summary card
  summaryCard: {
    backgroundColor: colors.primaryMuted,
    borderRadius: 18,
    gap: 12,
    padding: 18,
  },
  summaryTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  summaryName: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 26,
  },
  summaryDescription: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: typography.regular,
    fontSize: 14,
    marginTop: 2,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    minWidth: 72,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  playButtonDisabled: {
    opacity: 0.7,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 14,
  },
  schedulePill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scheduleText: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 13,
  },

  // Adapted badge
  adaptedBadge: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  adaptedText: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  adaptedEmphasis: {
    fontFamily: typography.bold,
  },

  // Section card
  sectionCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    overflow: 'hidden',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionTitle: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.bold,
    fontSize: 15,
  },
  sectionBodyWrap: {
    backgroundColor: colors.card,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionBody: {
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: 15,
    lineHeight: 24,
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  bulletText: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.regular,
    fontSize: 15,
    lineHeight: 22,
  },

  // Disclaimer
  disclaimer: {
    backgroundColor: colors.muted,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  disclaimerText: {
    color: colors.textMuted,
    fontFamily: typography.regular,
    fontSize: 12,
    lineHeight: 17,
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
