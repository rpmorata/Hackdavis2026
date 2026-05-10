import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Body, Card, Field, Label, Screen, Title } from '../components/ui';
import { useProfile } from '../context/ProfileContext';
import { colors } from '../theme';
import { PatientProfile, RouteName } from '../types';

const languages = ['Spanish', 'Chinese (Simplified)', 'Vietnamese', 'Arabic', 'Hindi', 'Tagalog', 'Korean', 'English'];
const cultures = ['Mexico', 'China', 'Vietnam', 'Middle East', 'India', 'Philippines', 'Korea', 'United States'];

export function OnboardingScreen({ go }: { go: (route: RouteName) => void }) {
  const { setProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('Spanish');
  const [culture, setCulture] = useState('Mexico');
  const [healthLiteracy, setHealthLiteracy] = useState<PatientProfile['healthLiteracy']>('some');
  const [terminology, setTerminology] = useState<PatientProfile['medicalTerminology']>('plain');
  const [decisionMaker, setDecisionMaker] = useState<PatientProfile['decisionMaker']>('shared');
  const [tone, setTone] = useState<PatientProfile['communicationTone']>('warm');
  const [format, setFormat] = useState<PatientProfile['outputFormat']>('both');

  const canContinue = useMemo(() => step > 0 || name.trim().length > 0, [name, step]);

  async function finish() {
    await setProfile({
      name: name.trim() || 'Patient',
      language,
      healthLiteracy,
      medicalTerminology: terminology,
      culturalBackground: culture,
      timeInUS: 'not-specified',
      westernMedicineFamiliarity: 'some',
      decisionMaker,
      familyMode: decisionMaker !== 'myself',
      medicalTrust: 'mixed',
      communicationTone: tone,
      outputFormat: format,
      fontSize: 'normal',
      onboardingComplete: true,
    });
    go('home');
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.progress}>Step {step + 1} of 3</Text>
          <Title>{step === 0 ? 'Personalize the translator' : step === 1 ? 'Language and culture' : 'Communication style'}</Title>
        </View>

        {step === 0 ? (
          <View style={styles.group}>
            <Label>Name</Label>
            <Field value={name} onChangeText={setName} placeholder="Patient name" autoCapitalize="words" />
            <ChoiceGroup
              label="Reading comfort"
              value={healthLiteracy}
              onChange={(value) => setHealthLiteracy(value as PatientProfile['healthLiteracy'])}
              items={[
                ['fluent', 'Comfortable reading medical documents'],
                ['some', 'Prefer simpler written explanations'],
                ['audio', 'Prefer audio and short summaries'],
              ]}
            />
            <ChoiceGroup
              label="Medical terminology"
              value={terminology}
              onChange={(value) => setTerminology(value as PatientProfile['medicalTerminology'])}
              items={[
                ['clinical', 'Use clinical terms'],
                ['plain', 'Use plain language'],
                ['simple', 'Use very simple language'],
              ]}
            />
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.group}>
            <PickerGrid label="Preferred language" value={language} values={languages} onChange={setLanguage} />
            <PickerGrid label="Cultural background" value={culture} values={cultures} onChange={setCulture} />
            <ChoiceGroup
              label="Medical decisions"
              value={decisionMaker}
              onChange={(value) => setDecisionMaker(value as PatientProfile['decisionMaker'])}
              items={[
                ['myself', 'I decide for myself'],
                ['shared', 'I decide with family or caregiver'],
                ['family', 'Family usually helps decide'],
              ]}
            />
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.group}>
            <ChoiceGroup
              label="Tone"
              value={tone}
              onChange={(value) => setTone(value as PatientProfile['communicationTone'])}
              items={[
                ['direct', 'Direct and concise'],
                ['warm', 'Warm and reassuring'],
                ['gentle', 'Gentle for sensitive topics'],
              ]}
            />
            <ChoiceGroup
              label="Output format"
              value={format}
              onChange={(value) => setFormat(value as PatientProfile['outputFormat'])}
              items={[
                ['voice', 'Voice only'],
                ['text', 'Text only'],
                ['both', 'Voice and text'],
              ]}
            />
            <Card>
              <Body>
                These settings tune wording, reading level, and cultural notes. You can update them from Profile.
              </Body>
            </Card>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.actions}>
        {step > 0 ? <ActionButton variant="secondary" onPress={() => setStep((value) => value - 1)}>Back</ActionButton> : null}
        <ActionButton
          onPress={() => (step === 2 ? finish() : setStep((value) => value + 1))}
          disabled={!canContinue}
          style={!canContinue ? styles.disabled : undefined}
        >
          {step === 2 ? 'Finish Setup' : 'Continue'}
        </ActionButton>
      </View>
    </Screen>
  );
}

function ChoiceGroup({
  label,
  value,
  items,
  onChange,
}: {
  label: string;
  value: string;
  items: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.group}>
      <Label>{label}</Label>
      {items.map(([itemValue, itemLabel]) => (
        <Pressable
          key={itemValue}
          onPress={() => onChange(itemValue)}
          style={[styles.choice, value === itemValue && styles.choiceActive]}
        >
          <Text style={styles.choiceText}>{itemLabel}</Text>
          {value === itemValue ? <MaterialIcons name="check-circle" size={22} color={colors.accent} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

function PickerGrid({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.group}>
      <Label>{label}</Label>
      <View style={styles.grid}>
        {values.map((item) => (
          <Pressable key={item} onPress={() => onChange(item)} style={[styles.gridItem, value === item && styles.gridActive]}>
            <Text style={[styles.gridText, value === item && styles.gridTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 22,
    padding: 18,
    paddingBottom: 120,
  },
  header: {
    gap: 8,
    paddingTop: 8,
  },
  progress: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  group: {
    gap: 12,
  },
  choice: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 54,
    paddingHorizontal: 14,
  },
  choiceActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  choiceText: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  gridActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  gridText: {
    color: colors.text,
    fontWeight: '700',
  },
  gridTextActive: {
    color: '#FFFFFF',
  },
  actions: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    left: 0,
    padding: 18,
    position: 'absolute',
    right: 0,
  },
  disabled: {
    opacity: 0.45,
  },
});
