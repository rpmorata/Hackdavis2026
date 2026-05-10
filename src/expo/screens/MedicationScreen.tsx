import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Body, Card, Field, Label, Screen, Title } from '../components/ui';
import { colors } from '../theme';

const meds: Record<string, { use: string; how: string; sideEffects: string[]; warning: string }> = {
  lisinopril: {
    use: 'Helps lower blood pressure and protects the heart and kidneys.',
    how: 'Take once daily at the same time. Stand up slowly because it can make some people lightheaded.',
    sideEffects: ['Dry cough', 'Dizziness', 'High potassium on blood tests'],
    warning: 'Call a clinician urgently for swelling of lips, face, or trouble breathing.',
  },
  metformin: {
    use: 'Helps control blood sugar in type 2 diabetes.',
    how: 'Take with meals to reduce stomach upset. Extended-release tablets should not be crushed.',
    sideEffects: ['Nausea', 'Loose stools', 'Metallic taste'],
    warning: 'Ask a clinician before taking it if you are dehydrated or have kidney problems.',
  },
  amoxicillin: {
    use: 'An antibiotic used for some bacterial infections.',
    how: 'Take until the prescription is finished unless a clinician tells you to stop.',
    sideEffects: ['Rash', 'Diarrhea', 'Upset stomach'],
    warning: 'Seek care for hives, trouble breathing, or severe diarrhea.',
  },
};

export function MedicationScreen() {
  const [query, setQuery] = useState('lisinopril');
  const key = query.trim().toLowerCase();
  const med = meds[key];

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Title style={{ color: '#FFFFFF' }}>Medication Explainer</Title>
          <Body style={{ color: '#DCEBE6' }}>Plain-language prescription support with safety reminders.</Body>
        </View>

        <View style={styles.search}>
          <Field value={query} onChangeText={setQuery} placeholder="Search medication" autoCapitalize="none" />
          <View style={styles.quick}>
            {Object.keys(meds).map((name) => (
              <Pressable key={name} onPress={() => setQuery(name)} style={styles.quickButton}>
                <Text style={styles.quickText}>{name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {med ? (
          <Card style={styles.card}>
            <View style={styles.medHead}>
              <View>
                <Text style={styles.medName}>{titleCase(key)}</Text>
                <Body>Common explanation</Body>
              </View>
              <MaterialIcons name="volume-up" size={26} color={colors.accent} />
            </View>
            <InfoBlock icon="health-and-safety" title="What it is for" body={med.use} />
            <InfoBlock icon="schedule" title="How to take it" body={med.how} />
            <View style={styles.block}>
              <Label>Possible side effects</Label>
              {med.sideEffects.map((item) => (
                <Text key={item} style={styles.bullet}>- {item}</Text>
              ))}
            </View>
            <View style={styles.warning}>
              <MaterialIcons name="warning-amber" size={20} color={colors.warning} />
              <Text style={styles.warningText}>{med.warning}</Text>
            </View>
          </Card>
        ) : (
          <Card style={styles.empty}>
            <MaterialIcons name="search-off" size={34} color={colors.textMuted} />
            <Label>No local explainer yet</Label>
            <Body style={{ textAlign: 'center' }}>Try lisinopril, metformin, or amoxicillin for the demo data.</Body>
          </Card>
        )}

        <ActionButton variant="secondary">Ask clinician to review</ActionButton>
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
  card: {
    gap: 16,
    marginHorizontal: 18,
  },
  medHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medName: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
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
  empty: {
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 18,
  },
});
