import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActionButton, Body, Screen, Title } from '../components/ui';
import { colors, typography } from '../theme';
import { RouteName } from '../types';
import { useProfile } from '../context/ProfileContext';

export function WelcomeScreen({ go }: { go: (route: RouteName) => void }) {
  const { profile } = useProfile();

  return (
    <Screen>
      <View style={styles.center}>
        <View style={styles.mark}>
          <MaterialIcons name="public" size={58} color="#FFFFFF" />
        </View>
        <Title style={styles.logo}>ClarityMD</Title>
        <Body style={styles.copy}>
          Understand your healthcare in your own language
        </Body>
      </View>
      <View style={styles.footer}>
        <ActionButton
          style={styles.welcomeButton}
          onPress={() => go(profile?.onboardingComplete ? 'home' : 'onboarding')}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Get Started</Text>
            <MaterialIcons name="arrow-forward" size={28} color="#FFFFFF" />
          </View>
        </ActionButton>
        <Text style={styles.meta}>Free for patients · No clinician enrollment required</Text>
        <View style={styles.disclaimer}>
          <Text style={styles.note}>
            ClarityMD is an AI-assisted communication tool, not a licensed medical interpreter and does not provide
            medical advice. All clinical decisions must be made by a qualified healthcare provider.
          </Text>
        </View>
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
    paddingTop: 68,
  },
  mark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 32,
    height: 104,
    justifyContent: 'center',
    marginBottom: 34,
    width: 104,
  },
  logo: {
    color: colors.primary,
    fontFamily: typography.bold,
    fontSize: 42,
    includeFontPadding: false,
    lineHeight: 52,
  },
  copy: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 28,
    marginTop: 12,
    maxWidth: 320,
    textAlign: 'center',
  },
  footer: {
    gap: 18,
    paddingBottom: 74,
    paddingHorizontal: 18,
  },
  welcomeButton: {
    backgroundColor: colors.accent,
    borderRadius: 22,
  },
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 16,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: typography.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  disclaimer: {
    backgroundColor: colors.accentSoft,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  note: {
    color: colors.textMuted,
    fontFamily: typography.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
