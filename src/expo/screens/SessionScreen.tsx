import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton, Body, Card, Label, Screen, Title } from '../components/ui';
import { Waveform } from '../components/Waveform';
import { useProfile } from '../context/ProfileContext';
import { colors } from '../theme';

export function SessionScreen() {
  const { profile, addSession } = useProfile();
  const [recording, setRecording] = useState(false);
  const [input, setInput] = useState('');
  const [translated, setTranslated] = useState('');

  async function translate() {
    const source = input.trim() || 'Your blood pressure is elevated. Take this medication once a day with water.';
    const simple = profile?.medicalTerminology === 'simple';
    const next =
      profile?.language === 'Spanish'
        ? simple
          ? 'Su presion esta alta. Tome esta medicina una vez al dia con agua.'
          : 'Su presion arterial esta elevada. Tome este medicamento una vez al dia con agua.'
        : `${profile?.language ?? 'Selected language'} translation: ${source}`;
    setTranslated(next);
    await addSession({
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      title: 'Live Translation Session',
      originalText: source,
      translatedText: next,
      culturalNote:
        profile?.decisionMaker !== 'myself'
          ? 'Consider sharing this explanation with the family member or caregiver who helps with medical decisions.'
          : undefined,
    });
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Title style={{ color: '#FFFFFF' }}>Live Session</Title>
          <Body style={{ color: '#DCEBE6' }}>Translate clinical language into {profile?.language ?? 'the patient language'}.</Body>
        </View>

        <Card style={styles.recorder}>
          <Waveform active={recording} />
          <ActionButton onPress={() => setRecording((value) => !value)}>
            <View style={styles.buttonInner}>
              <MaterialIcons name={recording ? 'stop' : 'mic'} size={22} color="#FFFFFF" />
              <Text style={styles.buttonText}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
            </View>
          </ActionButton>
        </Card>

        <View style={styles.group}>
          <Label>Clinician text</Label>
          <TextInput
            multiline
            onChangeText={setInput}
            placeholder="Type or paste what the clinician said..."
            placeholderTextColor={colors.textMuted}
            style={styles.textArea}
            value={input}
          />
          <ActionButton onPress={translate}>Translate</ActionButton>
        </View>

        {translated ? (
          <Card style={styles.output}>
            <Label>Patient-friendly explanation</Label>
            <Text style={styles.translated}>{translated}</Text>
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
    marginHorizontal: 18,
    marginTop: 18,
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
  translated: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
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
