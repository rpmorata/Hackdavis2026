import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { HomeScreen } from './screens/HomeScreen';
import { MedicationScreen } from './screens/MedicationScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SessionScreen } from './screens/SessionScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { colors } from './theme';
import { RouteName } from './types';

const tabs: Array<{ route: RouteName; label: string; icon: keyof typeof MaterialIcons.glyphMap }> = [
  { route: 'home', label: 'Home', icon: 'home' },
  { route: 'session', label: 'Session', icon: 'mic' },
  { route: 'medication', label: 'Meds', icon: 'medication' },
  { route: 'profile', label: 'Profile', icon: 'person' },
];

export default function App() {
  return (
    <ProfileProvider>
      <AppShell />
    </ProfileProvider>
  );
}

function AppShell() {
  const { hydrated, profile } = useProfile();
  const [route, setRoute] = useState<RouteName>('welcome');
  const [fontsLoaded] = useFonts({
    'Lato-Bold': require('../../assets/fonts/Lato-Bold.ttf'),
    'Lato-Regular': require('../../assets/fonts/Lato-Regular.ttf'),
  });

  useEffect(() => {
    if (!hydrated) return;
    setRoute(profile?.onboardingComplete ? 'home' : 'welcome');
  }, [hydrated, profile?.onboardingComplete]);

  if (!hydrated || !fontsLoaded) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  const showTabs = tabs.some((tab) => tab.route === route);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={route === 'welcome' ? 'dark' : 'light'} />
      <View style={styles.app}>
        {route === 'welcome' ? <WelcomeScreen go={setRoute} /> : null}
        {route === 'onboarding' ? <OnboardingScreen go={setRoute} /> : null}
        {route === 'home' ? <HomeScreen go={setRoute} /> : null}
        {route === 'session' ? <SessionScreen /> : null}
        {route === 'medication' ? <MedicationScreen /> : null}
        {route === 'profile' ? <ProfileScreen go={setRoute} /> : null}
        {showTabs ? <TabBar current={route} go={setRoute} /> : null}
      </View>
    </SafeAreaView>
  );
}

function TabBar({ current, go }: { current: RouteName; go: (route: RouteName) => void }) {
  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => {
        const active = tab.route === current;
        return (
          <Pressable key={tab.route} onPress={() => go(tab.route)} style={styles.tab}>
            <MaterialIcons name={tab.icon} size={24} color={active ? colors.accent : colors.textMuted} />
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.primary,
    flex: 1,
  },
  app: {
    backgroundColor: colors.background,
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  tabs: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    paddingBottom: 6,
    paddingTop: 8,
    position: 'absolute',
    right: 0,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.accent,
  },
});
