import { MaterialIcons } from '@expo/vector-icons';
import {
  AudioModule,
  createAudioPlayer,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import React, { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Body, Screen } from '../components/ui';
import { Waveform } from '../components/Waveform';
import { useProfile } from '../context/ProfileContext';
import { releaseAudioUri } from '../services/audio';
import { synthesize, transcribe } from '../services/elevenlabs';
import { simplifyAndTranslate } from '../services/gemini';
import { colors, typography } from '../theme';

type Stage = 'idle' | 'recording' | 'transcribing' | 'translating' | 'speaking';

const STAGE_COPY: Record<Stage, { label: string; status: string }> = {
  idle: { label: '', status: 'Ready to start' },
  recording: { label: 'Listening for clinical speech…', status: 'Listening...' },
  transcribing: { label: 'Transcribing speech…', status: 'Processing...' },
  translating: { label: 'Adapting for you…', status: 'Processing...' },
  speaking: { label: 'Generating voice…', status: 'Processing...' },
};

export function SessionScreen() {
  const { profile, addSession } = useProfile();
  const language = profile?.language ?? 'English';
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  const [stage, setStage] = useState<Stage>('idle');
  const [originalText, setOriginalText] = useState<string>('');
  const [translated, setTranslated] = useState<string>('');
  const [culturalNote, setCulturalNote] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');

  const wantsVoice = profile?.outputFormat !== 'text';
  const isListening = stage === 'recording';
  const isProcessing =
    stage === 'transcribing' || stage === 'translating' || stage === 'speaking';
  const hasResult = !!translated;
  const showIdle = !isListening && !isProcessing && !hasResult;
  const statusLabel = hasResult && stage === 'idle' ? 'Ready for more' : STAGE_COPY[stage].status;

  function showError(err: unknown) {
    setError(err instanceof Error ? err.message : String(err));
    setStage('idle');
  }

  function play(uri: string) {
    try {
      playerRef.current?.release?.();
    } catch {}
    const player = createAudioPlayer({ uri });
    playerRef.current = player;
    player.play();
  }

  function reset() {
    setStage('idle');
    setOriginalText('');
    setTranslated('');
    setCulturalNote(null);
    setError(null);
    setQuestion('');
    releaseAudioUri(audioUri);
    setAudioUri(null);
  }

  async function startRecording() {
    setError(null);
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        setError('Microphone permission denied. Enable it in your device settings.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setStage('recording');
    } catch (err) {
      showError(err);
    }
  }

  async function stopAndProcess() {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error('Recording produced no audio.');
      setStage('transcribing');
      const transcript = await transcribe({ uri });
      setOriginalText(transcript);
      await runTranslation(transcript);
    } catch (err) {
      showError(err);
    } finally {
      try {
        await setAudioModeAsync({ allowsRecording: false });
      } catch {}
    }
  }

  async function runTranslation(source: string) {
    try {
      setError(null);
      setStage('translating');
      const result = await simplifyAndTranslate({ text: source, profile });
      setTranslated(result.simplified);
      setCulturalNote(result.culturalNote ?? null);

      let savedAudioUri: string | undefined;
      if (wantsVoice) {
        setStage('speaking');
        savedAudioUri = await synthesize(result.simplified);
        releaseAudioUri(audioUri);
        setAudioUri(savedAudioUri);
        play(savedAudioUri);
      } else {
        releaseAudioUri(audioUri);
        setAudioUri(null);
      }

      await addSession({
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        title: 'Live Translation Session',
        originalText: source,
        translatedText: result.simplified,
        culturalNote: result.culturalNote,
        audioUri: savedAudioUri,
      });
      setStage('idle');
    } catch (err) {
      showError(err);
    }
  }

  function onPrimaryPress() {
    if (showIdle) return startRecording();
    if (isListening) return stopAndProcess();
    if (hasResult) {
      if (audioUri) {
        play(audioUri);
      } else {
        reset();
      }
    }
  }

  return (
    <Screen padded={false}>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>Live Session</Text>
            <Text style={styles.headerSubtitle}>
              {language}
              {profile?.name ? ` · ${profile.name}` : ''}
            </Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  isProcessing && styles.statusDotProcessing,
                ]}
              />
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>
          {!showIdle ? (
            <Pressable onPress={reset} hitSlop={8} style={styles.resetChip}>
              <MaterialIcons name="refresh" size={18} color="#FFFFFF" />
            </Pressable>
          ) : null}
        </View>

        {/* Body */}
        <View style={styles.body}>
          {showIdle ? (
            <IdleView />
          ) : isListening || isProcessing ? (
            <ListeningView
              stage={stage}
              originalText={originalText}
              isProcessing={isProcessing}
            />
          ) : (
            <ResultView
              language={language}
              originalText={originalText}
              translated={translated}
              culturalNote={culturalNote}
              hasAudio={!!audioUri}
              onReplay={() => audioUri && play(audioUri)}
              question={question}
              setQuestion={setQuestion}
            />
          )}

          {error ? (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error-outline" size={16} color={colors.danger} />
              <Body style={{ color: colors.danger, flex: 1 }}>{error}</Body>
            </View>
          ) : null}
        </View>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <Pressable
            onPress={onPrimaryPress}
            disabled={isProcessing}
            style={({ pressed }) => [
              styles.cta,
              isListening && styles.ctaStop,
              isProcessing && styles.ctaDisabled,
              pressed && !isProcessing && styles.pressed,
            ]}
          >
            {isProcessing ? (
              <Text style={styles.ctaText}>{STAGE_COPY[stage].label}</Text>
            ) : (
              <View style={styles.ctaInner}>
                <MaterialIcons
                  name={
                    isListening
                      ? 'stop'
                      : hasResult && audioUri
                        ? 'mic'
                        : hasResult
                          ? 'refresh'
                          : 'mic'
                  }
                  size={22}
                  color="#FFFFFF"
                />
                <Text style={styles.ctaText}>
                  {isListening
                    ? 'Stop'
                    : hasResult
                      ? audioUri
                        ? 'Listen Again'
                        : 'New Session'
                      : 'Start Listening'}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

function IdleView() {
  return (
    <ScrollView contentContainerStyle={styles.idleContent} showsVerticalScrollIndicator={false}>
      <View style={styles.micCircle}>
        <MaterialIcons name="mic" size={56} color={colors.primary} />
      </View>
      <Text style={styles.idleTitle}>Ready to listen</Text>
      <Text style={styles.idleSubtitle}>
        Press the button below and point your device toward the speaker. ClarityMD will translate in real time.
      </Text>
      <View style={styles.tipCard}>
        <Text style={styles.tipText}>
          <Text style={styles.tipLabel}>Demo mode: </Text>
          Tap "Start Listening" to capture clinical speech. The AI translation and cultural adaptation appear after you stop.
        </Text>
      </View>
    </ScrollView>
  );
}

function ListeningView({
  stage,
  originalText,
  isProcessing,
}: {
  stage: Stage;
  originalText: string;
  isProcessing: boolean;
}) {
  return (
    <ScrollView contentContainerStyle={styles.listeningContent} showsVerticalScrollIndicator={false}>
      <View style={styles.captureCard}>
        <View style={styles.captureLabelRow}>
          <View style={[styles.statusDot, isProcessing && styles.statusDotProcessing]} />
          <Text style={styles.captureLabel}>
            {isProcessing ? STAGE_COPY[stage].status.toUpperCase() : "CAPTURING — DOCTOR'S SPEECH"}
          </Text>
        </View>
        <View style={styles.captureWaveform}>
          <Waveform active={!isProcessing} />
        </View>
        <Text style={styles.captureText}>
          {originalText || STAGE_COPY[stage].label}
        </Text>
      </View>
    </ScrollView>
  );
}

function ResultView({
  language,
  originalText,
  translated,
  culturalNote,
  hasAudio,
  onReplay,
  question,
  setQuestion,
}: {
  language: string;
  originalText: string;
  translated: string;
  culturalNote: string | null;
  hasAudio: boolean;
  onReplay: () => void;
  question: string;
  setQuestion: (value: string) => void;
}) {
  return (
    <View style={styles.resultRoot}>
      <ScrollView
        contentContainerStyle={styles.resultContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>DOCTOR (ORIGINAL)</Text>
          <Text style={styles.resultBody}>"{originalText}"</Text>
        </View>

        <View style={styles.resultCard}>
          <View style={styles.resultLabelRow}>
            {hasAudio ? (
              <Pressable onPress={onReplay} hitSlop={8}>
                <MaterialIcons name="volume-up" size={16} color={colors.primary} />
              </Pressable>
            ) : null}
            <Text style={styles.resultLabel}>{language.toUpperCase()} · ADAPTED FOR YOU</Text>
          </View>
          <Text style={styles.resultTranslated}>{translated}</Text>
        </View>

        {culturalNote ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>CULTURAL CONTEXT</Text>
            <Text style={styles.resultBody}>{culturalNote}</Text>
          </View>
        ) : null}

        <View style={styles.questionsHint}>
          <Text style={styles.questionsHintText}>
            <Text style={styles.questionsHintLabel}>Do you have questions? </Text>
            Type below in any language — ClarityMD will answer in {language}.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.questionRow}>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder={`Type your question in ${language}…`}
          placeholderTextColor={colors.textMuted}
          style={styles.questionInput}
        />
        <Pressable hitSlop={6} style={styles.sendButton} onPress={() => {}}>
          <MaterialIcons name="send" size={18} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const TAB_BAR_CLEARANCE = 60;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  headerTextBlock: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 22,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: typography.regular,
    fontSize: 14,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  statusDot: {
    backgroundColor: '#7DDFA8',
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  statusDotProcessing: {
    backgroundColor: colors.warning,
  },
  statusText: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: typography.regular,
    fontSize: 13,
  },
  resetChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  body: {
    flex: 1,
  },
  errorBanner: {
    alignItems: 'flex-start',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    margin: 18,
    padding: 12,
  },
  footer: {
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingBottom: 14,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 18,
  },
  ctaStop: {
    backgroundColor: '#2A3441',
  },
  ctaDisabled: {
    opacity: 0.65,
  },
  ctaInner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  ctaText: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 17,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  // Idle
  idleContent: {
    alignItems: 'center',
    flexGrow: 1,
    gap: 18,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 36,
  },
  micCircle: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 2,
    height: 140,
    justifyContent: 'center',
    width: 140,
  },
  idleTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 22,
    marginTop: 8,
  },
  idleSubtitle: {
    color: colors.textMuted,
    fontFamily: typography.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tipLabel: {
    color: colors.text,
    fontFamily: typography.bold,
  },
  tipText: {
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: 14,
    lineHeight: 20,
  },

  // Listening
  listeningContent: {
    padding: 18,
  },
  captureCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: 16,
    gap: 12,
    padding: 18,
  },
  captureLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  captureLabel: {
    color: colors.primary,
    fontFamily: typography.bold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  captureWaveform: {
    alignSelf: 'flex-start',
    transform: [{ scale: 0.7 }],
    transformOrigin: 'left',
  },
  captureText: {
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: 16,
    lineHeight: 24,
  },

  // Result
  resultRoot: {
    flex: 1,
  },
  resultContent: {
    gap: 14,
    padding: 18,
    paddingBottom: 8,
  },
  resultCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: 16,
    gap: 10,
    padding: 16,
  },
  resultLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  resultLabel: {
    color: colors.primary,
    fontFamily: typography.bold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  resultBody: {
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  resultTranslated: {
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: 18,
    lineHeight: 28,
  },
  questionsHint: {
    backgroundColor: colors.muted,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  questionsHintLabel: {
    color: colors.text,
    fontFamily: typography.bold,
  },
  questionsHintText: {
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  questionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 8,
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  questionInput: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontFamily: typography.regular,
    fontSize: 14,
    minHeight: 44,
    paddingHorizontal: 14,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
