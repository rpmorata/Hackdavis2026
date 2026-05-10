import { MaterialIcons } from '@expo/vector-icons';
import { createAudioPlayer } from 'expo-audio';
import React, { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Body, Card, IconRowButton, Label, Pill, Screen, Title } from '../components/ui';
import { useProfile } from '../context/ProfileContext';
import { colors, typography } from '../theme';
import { RouteName } from '../types';

const flags: Record<string, string> = {
  Albanian: '🇦🇱',
  Arabic: '🇸🇦',
  'Chinese (Simplified)': '🇨🇳',
  'Chinese (Traditional)': '🇹🇼',
  'Chinese (Hong Kong)': '🇭🇰',
  English: '🇺🇸',
  Filipino: '🇵🇭',
  French: '🇫🇷',
  German: '🇩🇪',
  Hindi: '🇮🇳',
  Italian: '🇮🇹',
  Japanese: '🇯🇵',
  Korean: '🇰🇷',
  Portuguese: '🇵🇹',
  Russian: '🇷🇺',
  Spanish: '🇪🇸',
  Tagalog: '🇵🇭',
  Vietnamese: '🇻🇳',
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroText}>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Title style={styles.heroTitle}>{profile?.name || 'Welcome back'}</Title>
            </View>
            <Pressable onPress={() => go('profile')} hitSlop={8} style={styles.gearChip}>
              <MaterialIcons name="settings" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
          <Pill style={styles.languagePill}>
            <Text style={styles.languageText}>
              {flag} {profile?.language ?? 'English'}
            </Text>
          </Pill>
        </View>

        <View style={styles.main}>
          <IconRowButton
            variant="primary"
            icon="mic"
            title="Start Session"
            subtitle="Real-time translation · AI adapted"
            onPress={() => go('session')}
          />
          <IconRowButton
            variant="tinted"
            icon="medication"
            title="Medication Explainer"
            subtitle="Understand any prescription · Side effects"
            onPress={() => go('medication')}
          />

          <View style={styles.sectionHead}>
            <Label>Recent Sessions</Label>
            <Text style={styles.count}>{sessions.length} total</Text>
          </View>

          {sessions.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="mic-none" size={22} color={colors.primary} />
              </View>
              <View style={styles.emptyText}>
                <Text style={styles.emptyTitle}>No sessions yet</Text>
                <Text style={styles.emptySubtitle}>
                  Tap Start Session above to record your first translation.
                </Text>
              </View>
            </View>
          ) : (
            <>
              {sessions.slice(0, 5).map((session) => (
                <Card key={session.id} style={styles.sessionCard}>
                  <View style={styles.sessionHead}>
                    <Label style={styles.sessionTitle}>{session.title}</Label>
                    {session.audioUri ? (
                      <Pressable
                        accessibilityLabel="Replay audio"
                        accessibilityRole="button"
                        onPress={() => playAudio(session.audioUri!)}
                        style={styles.replayButton}
                      >
                        <MaterialIcons name="volume-up" size={16} color={colors.primary} />
                      </Pressable>
                    ) : null}
                    <Text style={styles.date}>{session.date}</Text>
                  </View>
                  <Body numberOfLines={2}>{session.translatedText}</Body>
                  {session.culturalNote ? (
                    <View style={styles.note}>
                      <MaterialIcons name="diversity-3" size={14} color={colors.primary} />
                      <Text style={styles.noteText} numberOfLines={3}>
                        {session.culturalNote}
                      </Text>
                    </View>
                  ) : null}
                </Card>
              ))}
            </>
          )}

          <View style={styles.tip}>
            <Text style={styles.tipText}>
              <Text style={styles.tipLabel}>Tip: </Text>
              Use ClarityMD before appointments to prepare questions, during appointments to translate in real time, or after to review what was discussed.
            </Text>
          </View>
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
    gap: 18,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 26,
  },
  heroTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: typography.regular,
    fontSize: 14,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
  },
  gearChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  languagePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  languageText: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 14,
  },
  main: {
    gap: 14,
    padding: 18,
  },
  sectionHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  count: {
    color: colors.accent,
    fontFamily: typography.bold,
    fontSize: 14,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  emptyText: {
    flex: 1,
    gap: 2,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 15,
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontFamily: typography.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  sessionCard: {
    gap: 10,
  },
  sessionHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  sessionTitle: {
    flex: 1,
  },
  replayButton: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  date: {
    color: colors.textMuted,
    fontFamily: typography.regular,
    fontSize: 13,
  },
  note: {
    alignItems: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noteText: {
    color: colors.primary,
    flex: 1,
    fontFamily: typography.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  tip: {
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    marginTop: 4,
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
});
