import { MaterialIcons } from '@expo/vector-icons';
import { createAudioPlayer } from 'expo-audio';
import React, { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Body, Card, IconRowButton, Label, Pill, Screen, Title } from '../components/ui';
import { useProfile } from '../context/ProfileContext';
import { colors } from '../theme';
import { RouteName } from '../types';

const flags: Record<string, string> = {
  Spanish: '🇪🇸',
  'Chinese (Simplified)': '🇨🇳',
  Vietnamese: '🇻🇳',
  Arabic: '🇸🇦',
  Hindi: '🇮🇳',
  Tagalog: '🇵🇭',
  Korean: '🇰🇷',
  English: '🇺🇸',
};

export function HomeScreen({ go }: { go: (route: RouteName) => void }) {
  const { profile, sessions } = useProfile();
  const flag = profile?.language ? flags[profile.language] ?? '🌐' : '🌐';
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  function playAudio(uri: string) {
    try {
      playerRef.current?.release?.();
    } catch {}
    const player = createAudioPlayer({ uri });
    playerRef.current = player;
    player.play();
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Title style={styles.heroTitle}>{profile?.name || 'Welcome back'}</Title>
            </View>
            <MaterialIcons name="settings" size={24} color="#FFFFFF" onPress={() => go('profile')} />
          </View>
          <Pill style={styles.languagePill}>
            <Text style={styles.languageText}>{flag} {profile?.language ?? 'Spanish'}</Text>
          </Pill>
        </View>

        <View style={styles.main}>
          <IconRowButton
            icon="mic"
            title="Start Session"
            subtitle="Real-time translation with adapted explanations"
            onPress={() => go('session')}
          />
          <IconRowButton
            icon="medication"
            title="Medication Explainer"
            subtitle="Plain-language dosage and side-effect support"
            onPress={() => go('medication')}
          />

          <View style={styles.sectionHead}>
            <Label>Recent Sessions</Label>
            <Text style={styles.count}>{sessions.length} total</Text>
          </View>

          {sessions.slice(0, 5).map((session) => (
            <Card key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHead}>
                <Label style={{ flex: 1 }}>{session.title}</Label>
                {session.audioUri ? (
                  <Pressable
                    accessibilityLabel="Replay audio"
                    accessibilityRole="button"
                    onPress={() => playAudio(session.audioUri!)}
                    style={styles.replayButton}
                  >
                    <MaterialIcons name="volume-up" size={18} color={colors.accent} />
                  </Pressable>
                ) : null}
                <Text style={styles.date}>{session.date}</Text>
              </View>
              <Body numberOfLines={2}>{session.translatedText}</Body>
              {session.culturalNote ? (
                <View style={styles.note}>
                  <MaterialIcons name="diversity-3" size={16} color={colors.accent} />
                  <Text style={styles.noteText}>{session.culturalNote}</Text>
                </View>
              ) : null}
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 110,
  },
  hero: {
    backgroundColor: colors.primary,
    gap: 22,
    padding: 22,
    paddingBottom: 28,
  },
  heroTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  greeting: {
    color: '#DCEBE6',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroTitle: {
    color: '#FFFFFF',
  },
  languagePill: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  languageText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  main: {
    gap: 14,
    padding: 18,
  },
  sectionHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  count: {
    color: colors.accent,
    fontWeight: '800',
  },
  sessionCard: {
    gap: 10,
  },
  sessionHead: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  replayButton: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  note: {
    alignItems: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    padding: 10,
  },
  noteText: {
    color: colors.primary,
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
});
