import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/ui';
import { useProfile } from '../context/ProfileContext';
import { colors, typography } from '../theme';
import { PatientProfile, RouteName } from '../types';

const FLAGS: Record<string, string> = {
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

const TERMINOLOGY_LABEL: Record<PatientProfile['medicalTerminology'], string> = {
  clinical: 'Use medical words',
  plain: 'Plain everyday language',
  simple: 'Very simple words',
};

const LITERACY_LABEL: Record<PatientProfile['healthLiteracy'], string> = {
  fluent: 'Fluent reader',
  some: 'Reads some',
  audio: 'Prefers audio',
};

const DECISION_LABEL: Record<PatientProfile['decisionMaker'], string> = {
  myself: 'I decide for myself',
  shared: 'I decide with family',
  family: 'Family decides',
};

const TIME_IN_US_LABEL: Record<string, string> = {
  '<1': 'Less than 1 year',
  '1-5': '1–5 years',
  '5+': '5+ years',
  'born-us': 'Born in the US',
};

const TAB_BAR_CLEARANCE = 60;

export function ProfileScreen({ go }: { go: (route: RouteName) => void }) {
  const { profile, clearProfile } = useProfile();

  async function reset() {
    await clearProfile();
    go('welcome');
  }

  const language = profile?.language ?? 'English';
  const country = profile?.culturalBackground;
  const flag = FLAGS[language] ?? '🌐';
  const heroSubtitle = country && country !== 'Other' ? `${language} · ${country}` : language;
  const timeInUSDisplay = profile?.timeInUS ? TIME_IN_US_LABEL[profile.timeInUS] : undefined;

  return (
    <Screen padded={false}>
      <View style={styles.root}>
        <View style={styles.hero}>
          <View style={styles.flagChip}>
            <Text style={styles.flagText}>{flag}</Text>
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroName}>{profile?.name ?? 'Patient'}</Text>
            <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <SectionCard title="LANGUAGE & LITERACY">
            <Row icon="language" label="Medical language" value={language} />
            <Divider />
            <Row
              icon="chat-bubble-outline"
              label="Terminology level"
              value={TERMINOLOGY_LABEL[profile?.medicalTerminology ?? 'plain']}
            />
            <Divider />
            <Row
              icon="volume-up"
              label="Health literacy"
              value={LITERACY_LABEL[profile?.healthLiteracy ?? 'some']}
            />
          </SectionCard>

          <SectionCard title="CULTURAL BACKGROUND" tinted>
            <Row icon="language" label="Country of origin" value={country ?? 'Not specified'} />
            {timeInUSDisplay ? (
              <>
                <Divider />
                <Row icon="language" label="Time in the US" value={timeInUSDisplay} />
              </>
            ) : null}
          </SectionCard>

          <SectionCard title="FAMILY & DECISIONS">
            <Row
              icon="groups"
              label="Medical decisions"
              value={DECISION_LABEL[profile?.decisionMaker ?? 'myself']}
            />
          </SectionCard>

          <View style={styles.hipaaCard}>
            <View style={styles.hipaaHead}>
              <MaterialIcons name="verified-user" size={20} color={colors.primary} />
              <Text style={styles.hipaaTitle}>HIPAA-Ready Design</Text>
            </View>
            <Text style={styles.hipaaBody}>
              No real Protected Health Information (PHI) is stored in this demo. Your profile is saved locally on your device only. Clarity AI is designed with data privacy at its core.
            </Text>
          </View>

          <Pressable
            onPress={() => go('onboarding')}
            style={({ pressed }) => [styles.editRow, pressed && styles.pressed]}
          >
            <Text style={styles.editText}>Edit My Profile</Text>
            <MaterialIcons name="chevron-right" size={22} color={colors.textMuted} />
          </Pressable>

          <Pressable
            onPress={reset}
            style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="logout" size={18} color={colors.danger} />
            <Text style={styles.resetText}>Delete all my data</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Screen>
  );
}

function SectionCard({
  title,
  tinted,
  children,
}: {
  title: string;
  tinted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.section, tinted ? styles.sectionTinted : styles.sectionWhite]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <MaterialIcons name={icon} size={22} color={colors.primary} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 22,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  flagChip: {
    alignItems: 'center',
    backgroundColor: colors.primaryMuted,
    borderRadius: 14,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  flagText: {
    fontSize: 30,
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  heroName: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 28,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: typography.regular,
    fontSize: 14,
  },
  scroll: {
    gap: 14,
    padding: 18,
    paddingBottom: 32,
  },

  // Section cards
  section: {
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  sectionWhite: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
  },
  sectionTinted: {
    backgroundColor: colors.accentSoft,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontFamily: typography.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  sectionBody: {
    gap: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    color: colors.textMuted,
    fontFamily: typography.regular,
    fontSize: 13,
  },
  rowValue: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 16,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginLeft: 36,
  },

  // HIPAA card
  hipaaCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  hipaaHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  hipaaTitle: {
    color: colors.primary,
    fontFamily: typography.bold,
    fontSize: 15,
  },
  hipaaBody: {
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: 13,
    lineHeight: 19,
  },

  // Edit row
  editRow: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  editText: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.bold,
    fontSize: 16,
  },

  // Reset button (outlined danger)
  resetButton: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.danger,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  resetText: {
    color: colors.danger,
    fontFamily: typography.bold,
    fontSize: 16,
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
