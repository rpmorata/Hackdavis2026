import { MaterialIcons } from '@expo/vector-icons';
import { AudioModule, createAudioPlayer, RecordingPresets, useAudioRecorder } from 'expo-audio';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton, Body, Card, Label, Screen, Title } from '../components/ui';
import { Waveform } from '../components/Waveform';
import { useProfile } from '../context/ProfileContext';
import { releaseAudioUri } from '../services/audio';
import { transcribe, synthesize } from '../services/elevenlabs';
import { simplifyAndTranslate } from '../services/gemini';
import { colors } from '../theme';

type Stage = 'idle' | 'recording' | 'transcribing' | 'translating' | 'speaking';

const STAGE_LABEL: Record<Stage, string> = {
  idle: '',
  recording: 'Recording...',
  transcribing: 'Transcribing speech...',
  translating: 'Simplifying and translating...',
  speaking: 'Generating voice...',
};

export function SessionScreen() {
  const { profile, addSession } = useProfile();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  const [stage, setStage] = useState<Stage>('idle');
  const [input, setInput] = useState('');
  const [translated, setTranslated] = useState('');
  const [culturalNote, setCulturalNote] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isRecording = stage === 'recording';
  const isProcessing = stage === 'transcribing' || stage === 'translating' || stage === 'speaking';
  const wantsVoice = profile?.outputFormat !== 'text';

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

  async function startRecording() {
    setError(null);
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        setError('Microphone permission denied. Enable it in your device settings.');
        return;
      }
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
      setInput(transcript);
      await runFromText(transcript);
    } catch (err) {
      showError(err);
    }
  }

  async function runFromText(source: string) {
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
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
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

  async function onTranslatePress() {
    const source = input.trim();
    if (!source) {
      setError('Type or record some text before translating.');
      return;
    }
    await runFromText(source);
  }

  function onMicPress() {
    if (isRecording) {
      void stopAndProcess();
    } else if (!isProcessing) {
      void startRecording();
    }
  }

  const micIcon = isRecording ? 'stop' : isProcessing ? 'hourglass-empty' : 'mic';
  const micLabel = isRecording
    ? 'Stop & Translate'
    : isProcessing
      ? STAGE_LABEL[stage]
      : 'Start Recording';

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Title style={{ color: '#FFFFFF' }}>Live Session</Title>
          <Body style={{ color: '#DCEBE6' }}>
            Translate clinical language into {profile?.language ?? 'the patient language'}.
          </Body>
        </View>

        <Card style={styles.recorder}>
          <Waveform active={isRecording} />
          {isProcessing ? (
            <View style={styles.stageRow}>
              <ActivityIndicator color={colors.accent} />
              <Body style={{ color: colors.text }}>{STAGE_LABEL[stage]}</Body>
            </View>
          ) : null}
          <ActionButton onPress={onMicPress} disabled={isProcessing}>
            <View style={styles.buttonInner}>
              <MaterialIcons name={micIcon} size={22} color="#FFFFFF" />
              <Text style={styles.buttonText}>{micLabel}</Text>
            </View>
          </ActionButton>
        </Card>

        {error ? (
          <Card style={styles.errorCard}>
            <MaterialIcons name="error-outline" size={18} color={colors.danger} />
            <Body style={{ color: colors.danger, flex: 1 }}>{error}</Body>
          </Card>
        ) : null}

        <View style={styles.group}>
          <Label>Clinician text</Label>
          <TextInput
            multiline
            onChangeText={setInput}
            placeholder="Type or paste what the clinician said, or use the mic above."
            placeholderTextColor={colors.textMuted}
            style={styles.textArea}
            value={input}
            editable={!isProcessing}
          />
          <ActionButton onPress={onTranslatePress} disabled={isProcessing || isRecording}>
            Translate
          </ActionButton>
        </View>

        {translated ? (
          <Card style={styles.output}>
            <View style={styles.outputHead}>
              <Label style={{ flex: 1 }}>Patient-friendly explanation</Label>
              {audioUri ? (
                <MaterialIcons
                  name="volume-up"
                  size={22}
                  color={colors.accent}
                  onPress={() => audioUri && play(audioUri)}
                />
              ) : null}
            </View>
            <Text style={styles.translated}>{translated}</Text>
            {culturalNote ? (
              <View style={styles.note}>
                <MaterialIcons name="diversity-3" size={18} color={colors.primary} />
                <Body style={{ color: colors.primary, flex: 1 }}>{culturalNote}</Body>
              </View>
            ) : null}
            <View style={styles.disclaimer}>
              <MaterialIcons name="warning-amber" size={18} color={colors.warning} />
              <Body style={{ flex: 1 }}>AI output should be reviewed by a clinician before medical decisions.</Body>
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
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
  recorder: {
    gap: 12,
    marginHorizontal: 18,
    marginTop: 18,
  },
  stageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  buttonInner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  group: {
    gap: 10,
    paddingHorizontal: 18,
  },
  textArea: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 130,
    padding: 14,
    textAlignVertical: 'top',
  },
  output: {
    gap: 12,
    marginHorizontal: 18,
  },
  outputHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  translated: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  note: {
    alignItems: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    padding: 10,
  },
  disclaimer: {
    alignItems: 'flex-start',
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    padding: 10,
  },
});
