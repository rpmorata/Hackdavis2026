import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActionButton, Body, Screen, Title } from '../components/ui';
import { colors } from '../theme';
import { RouteName } from '../types';
import { useProfile } from '../context/ProfileContext';

export function WelcomeScreen({ go }: { go: (route: RouteName) => void }) {
  const { profile } = useProfile();

  return (
    <Screen>
      <View style={styles.center}>
        <View style={styles.mark}>
          <MaterialIcons name="health-and-safety" size={52} color="#FFFFFF" />
        </View>
        <Title style={styles.logo}>ClarityMD</Title>
        <Body style={styles.copy}>
          Culturally aware medical translation for visits, prescriptions, and follow-up instructions.
        </Body>
      </View>
      <View style={styles.footer}>
        <ActionButton onPress={() => go(profile?.onboardingComplete ? 'home' : 'onboarding')}>
          Get Started
        </ActionButton>
        <Text style={styles.note}>AI support for comprehension. Clinicians remain the source of medical advice.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  mark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 28,
    height: 104,
    justifyContent: 'center',
    marginBottom: 28,
    width: 104,
  },
  logo: {
    color: colors.primary,
    fontSize: 42,
  },
  copy: {
    marginTop: 12,
    maxWidth: 320,
    textAlign: 'center',
  },
  footer: {
    gap: 12,
    padding: 22,
  },
  note: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
});
