import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Body, Card, Label, Screen, Title } from '../components/ui';
import { useProfile } from '../context/ProfileContext';
import { colors } from '../theme';
import { RouteName } from '../types';

export function ProfileScreen({ go }: { go: (route: RouteName) => void }) {
  const { profile, clearProfile } = useProfile();

  async function reset() {
    await clearProfile();
    go('welcome');
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Title style={{ color: '#FFFFFF' }}>Profile</Title>
          <Body style={{ color: '#DCEBE6' }}>Settings used to adapt translation tone and detail.</Body>
        </View>

        <Card style={styles.card}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={34} color="#FFFFFF" />
          </View>
          <Title style={styles.name}>{profile?.name ?? 'Patient'}</Title>
          <Body>{profile?.language ?? 'Spanish'} medical information</Body>
        </Card>

        <Setting label="Reading comfort" value={profile?.healthLiteracy ?? 'some'} icon="menu-book" />
        <Setting label="Terminology" value={profile?.medicalTerminology ?? 'plain'} icon="translate" />
        <Setting label="Decision style" value={profile?.decisionMaker ?? 'shared'} icon="groups" />
        <Setting label="Tone" value={profile?.communicationTone ?? 'warm'} icon="record-voice-over" />
        <Setting label="Output" value={profile?.outputFormat ?? 'both'} icon="speaker-notes" />

        <ActionButton variant="secondary" onPress={() => go('onboarding')}>Edit Onboarding</ActionButton>
        <ActionButton variant="danger" onPress={reset}>Delete all my data</ActionButton>
      </ScrollView>
    </Screen>
  );
}

function Setting({ icon, label, value }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string }) {
  return (
    <Card style={styles.setting}>
      <MaterialIcons name={icon} size={24} color={colors.accent} />
      <View style={{ flex: 1 }}>
        <Body>{label}</Body>
        <Label style={{ marginTop: 2 }}>{value}</Label>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 110,
  },
  header: {
    backgroundColor: colors.primary,
    gap: 8,
    padding: 22,
  },
  card: {
    alignItems: 'center',
    gap: 8,
    margin: 18,
    marginBottom: 4,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  name: {
    fontSize: 24,
  },
  setting: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 18,
  },
});
