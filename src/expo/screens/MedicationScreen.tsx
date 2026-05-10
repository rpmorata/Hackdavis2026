import { MaterialIcons } from '@expo/vector-icons';
import { createAudioPlayer } from 'expo-audio';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Body, Card, Field, Label, Screen, Title } from '../components/ui';
import { useProfile } from '../context/ProfileContext';
import { releaseAudioUri } from '../services/audio';
import { askMedication, MedicationInfo } from '../services/backboard';
import { synthesize } from '../services/elevenlabs';
import { colors } from '../theme';

const SUGGESTIONS = ['lisinopril', 'metformin', 'amoxicillin', 'atorvastatin', 'metoprolol'];

type Stage = 'idle' | 'loading' | 'speaking';

export function MedicationScreen() {
  const { profile } = useProfile();
  const [query, setQuery] = useState('');
  const [info, setInfo] = useState<MedicationInfo | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  function showError(err: unknown) {
    setError(err instanceof Error ? err.message : String(err));
    setStage('idle');
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

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Title style={{ color: '#FFFFFF' }}>Medication Explainer</Title>
          <Body style={{ color: '#DCEBE6' }}>
            Plain-language prescription support in {profile?.language ?? 'your language'}, powered by OpenBioLLM.
          </Body>
        </View>

        <View style={styles.search}>
          <Field
            value={query}
            onChangeText={setQuery}
            placeholder="Search medication"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => lookup()}
            editable={stage !== 'loading'}
          />
          <ActionButton onPress={() => lookup()} disabled={stage !== 'idle'}>
            {stage === 'loading' ? 'Looking up...' : 'Look up'}
          </ActionButton>
          <View style={styles.quick}>
            {SUGGESTIONS.map((name) => (
              <Pressable
                key={name}
                onPress={() => pickSuggestion(name)}
                style={styles.quickButton}
                disabled={stage === 'loading'}
              >
                <Text style={styles.quickText}>{name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {error ? (
          <Card style={styles.errorCard}>
            <MaterialIcons name="error-outline" size={18} color={colors.danger} />
            <Body style={{ color: colors.danger, flex: 1 }}>{error}</Body>
          </Card>
        ) : null}

        {stage === 'loading' ? (
          <Card style={styles.loadingCard}>
            <ActivityIndicator color={colors.accent} />
            <Body>Asking OpenBioLLM about {query}...</Body>
          </Card>
        ) : null}

        {info && info.unknown ? (
          <Card style={styles.empty}>
            <MaterialIcons name="search-off" size={34} color={colors.textMuted} />
            <Label>No reliable information</Label>
            <Body style={{ textAlign: 'center' }}>
              The model could not confirm "{query}" as a medication it has reliable information for.
            </Body>
          </Card>
        ) : null}

        {info && !info.unknown ? (
          <Card style={styles.card}>
            <View style={styles.medHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.medName}>{titleCase(info.name)}</Text>
                <Body>OpenBioLLM explanation</Body>
              </View>
              <Pressable
                accessibilityLabel="Speak explanation"
                accessibilityRole="button"
                onPress={speak}
                style={styles.speakButton}
                disabled={stage !== 'idle'}
              >
                {stage === 'speaking' ? (
                  <ActivityIndicator color={colors.accent} />
                ) : (
                  <MaterialIcons
                    name={audioUri ? 'replay' : 'volume-up'}
                    size={22}
                    color={colors.accent}
                  />
                )}
              </Pressable>
            </View>
            {info.use ? <InfoBlock icon="health-and-safety" title="What it is for" body={info.use} /> : null}
            {info.how ? <InfoBlock icon="schedule" title="How to take it" body={info.how} /> : null}
            {info.sideEffects.length ? (
              <View style={styles.block}>
                <Label>Possible side effects</Label>
                {info.sideEffects.map((item, i) => (
                  <Text key={`${item}-${i}`} style={styles.bullet}>
                    - {item}
                  </Text>
                ))}
              </View>
            ) : null}
            {info.warning ? (
              <View style={styles.warning}>
                <MaterialIcons name="warning-amber" size={20} color={colors.warning} />
                <Text style={styles.warningText}>{info.warning}</Text>
              </View>
            ) : null}
            <View style={styles.disclaimer}>
              <MaterialIcons name="info-outline" size={16} color={colors.textMuted} />
              <Body style={{ color: colors.textMuted, flex: 1, fontSize: 12 }}>
                AI output should be reviewed by a clinician before medical decisions.
              </Body>
            </View>
          </Card>
        ) : null}

        {!info && !error && stage === 'idle' ? (
          <Card style={styles.empty}>
            <MaterialIcons name="medication" size={34} color={colors.textMuted} />
            <Label>Look up any medication</Label>
            <Body style={{ textAlign: 'center' }}>
              Type a name above or tap a suggestion to get plain-language info from OpenBioLLM.
            </Body>
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function InfoBlock({ icon, title, body }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; body: string }) {
  return (
    <View style={styles.infoBlock}>
      <MaterialIcons name={icon} size={20} color={colors.accent} />
      <View style={{ flex: 1 }}>
        <Label>{title}</Label>
        <Body style={{ marginTop: 4 }}>{body}</Body>
      </View>
    </View>
  );
}

function titleCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingBottom: 110,
  },
  header: {
    backgroundColor: colors.primary,
    gap: 8,
    padding: 22,
  },
  search: {
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  quick: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickButton: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickText: {
    color: colors.primary,
    fontWeight: '800',
  },
  errorCard: {
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderColor: colors.danger,
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 18,
  },
  loadingCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 18,
  },
  card: {
    gap: 16,
    marginHorizontal: 18,
  },
  medHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  medName: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
  },
  speakButton: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  infoBlock: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  block: {
    gap: 8,
  },
  bullet: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  warning: {
    alignItems: 'flex-start',
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  warningText: {
    color: colors.warning,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  disclaimer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 18,
  },
});
