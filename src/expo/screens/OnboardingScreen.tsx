import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ActionButton,
  Dropdown,
  Field,
  OptionCard,
  PillGrid,
  Screen,
  Title,
} from '../components/ui';
import { useProfile } from '../context/ProfileContext';
import { colors, typography } from '../theme';
import { PatientProfile, RouteName } from '../types';

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
] as const;

const COUNTRIES = [
  'Mexico',
  'China',
  'Vietnam',
  'Philippines',
  'El Salvador',
  'Guatemala',
  'India',
  'Cuba',
  'Dominican Republic',
  'Honduras',
  'South Korea',
  'Brazil',
  'Other',
] as const;

const RELIGIONS = [
  'Catholic',
  'Christian',
  'Islam',
  'Judaism',
  'Buddhism',
  'Hinduism',
  'Folk / Traditional',
  'None',
  'Prefer not to say',
] as const;

type Language = (typeof LANGUAGES)[number];
type Country = (typeof COUNTRIES)[number];
type Religion = (typeof RELIGIONS)[number];

type TimeInUS = '<1' | '1-5' | '5+' | 'born-us';
type WesternMed = 'comfortable' | 'some' | 'traditional';
type Trust = 'positive' | 'mixed' | 'distrust' | 'prefer-not';

const TOTAL_STEPS = 3;

export function OnboardingScreen({ go }: { go: (route: RouteName) => void }) {
  const { setProfile } = useProfile();
  const [step, setStep] = useState(0);

  // Step 1
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<Language | undefined>('Spanish');
  const [healthLiteracy, setHealthLiteracy] =
    useState<PatientProfile['healthLiteracy']>('fluent');
  const [terminology, setTerminology] =
    useState<PatientProfile['medicalTerminology']>('plain');

  // Step 2
  const [country, setCountry] = useState<Country | undefined>(undefined);
  const [timeInUS, setTimeInUS] = useState<TimeInUS | undefined>(undefined);
  const [westernMed, setWesternMed] = useState<WesternMed | undefined>(undefined);
  const [religion, setReligion] = useState<Religion | undefined>(undefined);

  // Step 3
  const [decisionMaker, setDecisionMaker] =
    useState<PatientProfile['decisionMaker']>('myself');
  const [trust, setTrust] = useState<Trust | undefined>(undefined);

  const canContinue = useMemo(() => {
    if (step === 0) return name.trim().length > 0 && !!language;
    if (step === 1) return !!country;
    return true;
  }, [step, name, language, country]);

  async function finish() {
    await setProfile({
      name: name.trim() || 'Patient',
      language: language ?? 'English',
      healthLiteracy,
      medicalTerminology: terminology,
      culturalBackground: country ?? 'Other',
      timeInUS: timeInUS ?? 'not-specified',
      westernMedicineFamiliarity: westernMed ?? 'some',
      religion,
      decisionMaker,
      familyMode: decisionMaker !== 'myself',
      medicalTrust: trust ?? 'mixed',
      communicationTone: 'warm',
      outputFormat: 'both',
      fontSize: 'normal',
      onboardingComplete: true,
    });
    go('home');
  }

  const headerProps = (() => {
    if (step === 0) {
      return {
        title: 'Language & Literacy',
        subtitle: 'Help us communicate in the right language, at the right level for you.',
      };
    }
    if (step === 1) {
      return {
        title: 'Cultural Background',
        subtitle: 'Tell us about your background so we can adapt how information is shared.',
      };
    }
    return {
      title: 'Family & Decisions',
      subtitle: 'Help us understand how medical decisions work in your family.',
    };
  })();

  return (
    <Screen padded={false}>
      <OnboardingHeader
        step={step + 1}
        total={TOTAL_STEPS}
        title={headerProps.title}
        subtitle={headerProps.subtitle}
        onBack={step > 0 ? () => setStep((value) => value - 1) : undefined}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 0 ? (
          <>
            <View style={styles.disclaimerCard}>
              <MaterialIcons name="info-outline" size={20} color={colors.primary} />
              <Text style={styles.disclaimerText}>
                <Text style={{ fontFamily: typography.bold }}>Demo Notice:</Text> Clarity AI is a demonstration tool. It is not covered by a BAA and should not be used with real Protected Health Information (PHI).
              </Text>
            </View>

            <Section label="What is your name?" required>
              <Field
                variant="filled"
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                autoCapitalize="words"
              />
            </Section>

            <Section label="Preferred language for medical information" required>
              <Dropdown
                value={language}
                options={LANGUAGES}
                placeholder="Select a language"
                onChange={(v) => setLanguage(v as Language | undefined)}
              />
            </Section>

            <Section label="How well can you read in your language?" required>
              <View style={styles.stack}>
                <OptionCard
                  title="I read fluently"
                  subtitle="I am comfortable reading documents"
                  selected={healthLiteracy === 'fluent'}
                  onPress={() => setHealthLiteracy('fluent')}
                />
                <OptionCard
                  title="I read some"
                  subtitle="I understand simple words and sentences"
                  selected={healthLiteracy === 'some'}
                  onPress={() => setHealthLiteracy('some')}
                />
                <OptionCard
                  title="I prefer audio"
                  subtitle="Please read everything out loud to me"
                  selected={healthLiteracy === 'audio'}
                  onPress={() => setHealthLiteracy('audio')}
                />
              </View>
            </Section>

            <Section label="Medical terms — what level do you prefer?" required>
              <View style={styles.stack}>
                <OptionCard
                  title="Use medical words"
                  subtitle="I understand clinical terminology"
                  selected={terminology === 'clinical'}
                  onPress={() => setTerminology('clinical')}
                />
                <OptionCard
                  title="Plain everyday language"
                  subtitle="Explain things simply, like to a friend"
                  selected={terminology === 'plain'}
                  onPress={() => setTerminology('plain')}
                />
                <OptionCard
                  title="Very simple words"
                  subtitle="Use easy words, short sentences, examples"
                  selected={terminology === 'simple'}
                  onPress={() => setTerminology('simple')}
                />
              </View>
            </Section>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Section label="Country of origin or cultural background" required>
              <PillGrid
                values={COUNTRIES}
                value={country}
                onChange={(v) => setCountry(v)}
                columns={2}
              />
            </Section>

            <Section label="How long have you been in the United States?" optional>
              <View style={styles.stack}>
                <OptionCard
                  title="Less than 1 year"
                  subtitle="Recent arrival"
                  selected={timeInUS === '<1'}
                  onPress={() => setTimeInUS('<1')}
                />
                <OptionCard
                  title="1 – 5 years"
                  selected={timeInUS === '1-5'}
                  onPress={() => setTimeInUS('1-5')}
                />
                <OptionCard
                  title="5+ years"
                  selected={timeInUS === '5+'}
                  onPress={() => setTimeInUS('5+')}
                />
                <OptionCard
                  title="Born in the US"
                  selected={timeInUS === 'born-us'}
                  onPress={() => setTimeInUS('born-us')}
                />
              </View>
            </Section>

            <Section label="Experience with Western medicine" optional>
              <View style={styles.stack}>
                <OptionCard
                  title="Comfortable"
                  subtitle="I have used it for many years"
                  selected={westernMed === 'comfortable'}
                  onPress={() => setWesternMed('comfortable')}
                />
                <OptionCard
                  title="Some experience"
                  subtitle="I know the basics"
                  selected={westernMed === 'some'}
                  onPress={() => setWesternMed('some')}
                />
                <OptionCard
                  title="Traditional medicine background"
                  subtitle="I grew up with herbal or traditional remedies"
                  selected={westernMed === 'traditional'}
                  onPress={() => setWesternMed('traditional')}
                />
              </View>
            </Section>

            <Section
              label="Religious affiliation"
              optionalHint="optional — helps us adapt sensitive topics"
            >
              <PillGrid
                values={RELIGIONS}
                value={religion}
                onChange={(v) => setReligion(v)}
                columns={2}
              />
            </Section>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Section label="Who makes medical decisions for you?" required>
              <View style={styles.stack}>
                <OptionCard
                  title="I decide for myself"
                  selected={decisionMaker === 'myself'}
                  onPress={() => setDecisionMaker('myself')}
                />
                <OptionCard
                  title="I decide with family"
                  subtitle="I discuss decisions with family members"
                  selected={decisionMaker === 'shared'}
                  onPress={() => setDecisionMaker('shared')}
                />
                <OptionCard
                  title="Family decides"
                  subtitle="A family member is my primary decision-maker"
                  selected={decisionMaker === 'family'}
                  onPress={() => setDecisionMaker('family')}
                />
              </View>
            </Section>

            <Section label="Healthcare trust level" optional>
              <View style={styles.stack}>
                <OptionCard
                  title="Positive"
                  subtitle="I generally trust the healthcare system"
                  selected={trust === 'positive'}
                  onPress={() => setTrust('positive')}
                />
                <OptionCard
                  title="Mixed"
                  subtitle="I have had both good and bad experiences"
                  selected={trust === 'mixed'}
                  onPress={() => setTrust('mixed')}
                />
                <OptionCard
                  title="Some distrust"
                  subtitle="I have concerns or bad past experiences"
                  selected={trust === 'distrust'}
                  onPress={() => setTrust('distrust')}
                />
                <OptionCard
                  title="Prefer not to say"
                  selected={trust === 'prefer-not'}
                  onPress={() => setTrust('prefer-not')}
                />
              </View>
            </Section>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.actions}>
        <ActionButton
          onPress={() => (step === TOTAL_STEPS - 1 ? finish() : setStep((value) => value + 1))}
          disabled={!canContinue}
          style={[styles.cta, !canContinue && styles.disabled]}
        >
          <View style={styles.ctaContent}>
            {step === TOTAL_STEPS - 1 ? (
              <MaterialIcons name="check" size={22} color="#FFFFFF" />
            ) : null}
            <Text style={styles.ctaText}>
              {step === TOTAL_STEPS - 1 ? 'Complete Setup' : 'Continue'}
            </Text>
          </View>
        </ActionButton>
      </View>
    </Screen>
  );
}

function OnboardingHeader({
  step,
  total,
  title,
  subtitle,
  onBack,
}: {
  step: number;
  total: number;
  title: string;
  subtitle: string;
  onBack?: () => void;
}) {
  const progress = step / total;
  return (
    <View>
      <View style={styles.headerBand}>
        <View style={styles.headerRow}>
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={8} style={styles.backChip}>
              <MaterialIcons name="chevron-left" size={22} color={colors.text} />
            </Pressable>
          ) : null}
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerEyebrow}>
              Step {step} of {total}
            </Text>
            <Title style={styles.headerTitle}>{title}</Title>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
      <View style={styles.subtitleBand}>
        <Text style={styles.subtitleText}>{subtitle}</Text>
      </View>
    </View>
  );
}

function Section({
  label,
  required,
  optional,
  optionalHint,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  optionalHint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>
        {label}
        {required ? <Text style={styles.requiredMark}> *</Text> : null}
        {optional ? <Text style={styles.optionalHint}> (optional)</Text> : null}
        {optionalHint ? <Text style={styles.optionalHint}> ({optionalHint})</Text> : null}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBand: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  backChip: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  headerTextBlock: {
    flex: 1,
    gap: 4,
  },
  headerEyebrow: {
    color: colors.textMuted,
    fontFamily: typography.regular,
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 26,
    lineHeight: 32,
  },
  progressTrack: {
    backgroundColor: colors.card,
    borderRadius: 999,
    height: 6,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: '100%',
  },
  subtitleBand: {
    backgroundColor: colors.muted,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  subtitleText: {
    color: colors.textMuted,
    fontFamily: typography.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    gap: 24,
    padding: 18,
    paddingBottom: 140,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 16,
  },
  requiredMark: {
    color: colors.primary,
    fontFamily: typography.bold,
  },
  optionalHint: {
    color: colors.textMuted,
    fontFamily: typography.regular,
  },
  stack: {
    gap: 10,
  },
  actions: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: 18,
    paddingBottom: 28,
    position: 'absolute',
    right: 0,
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 18,
    minHeight: 58,
  },
  ctaContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 17,
  },
  disabled: {
    opacity: 0.45,
  },
  disclaimerCard: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  disclaimerText: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.regular,
    fontSize: 14,
    lineHeight: 20,
  },
});
