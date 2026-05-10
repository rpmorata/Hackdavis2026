import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { PatientProfile, SessionEntry } from '../types';

interface ProfileContextType {
  profile: PatientProfile | null;
  hydrated: boolean;
  sessions: SessionEntry[];
  setProfile: (profile: PatientProfile) => Promise<void>;
  updateProfile: (updates: Partial<PatientProfile>) => Promise<void>;
  addSession: (session: SessionEntry) => Promise<void>;
  clearProfile: () => Promise<void>;
}

const PROFILE_KEY = 'claritymd_profile';
const SESSIONS_KEY = 'claritymd_sessions';

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [profileState, setProfileState] = useState<PatientProfile | null>(null);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);

  useEffect(() => {
    let active = true;
    async function hydrate() {
      const [storedProfile, storedSessions] = await Promise.all([
        AsyncStorage.getItem(PROFILE_KEY),
        AsyncStorage.getItem(SESSIONS_KEY),
      ]);
      if (!active) return;
      if (storedProfile) setProfileState(JSON.parse(storedProfile));
      if (storedSessions) setSessions(JSON.parse(storedSessions));
      setHydrated(true);
    }
    hydrate().catch(() => setHydrated(true));
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<ProfileContextType>(
    () => ({
      profile: profileState,
      hydrated,
      sessions,
      async setProfile(profile) {
        setProfileState(profile);
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      },
      async updateProfile(updates) {
        const updated = { ...(profileState ?? ({} as PatientProfile)), ...updates };
        setProfileState(updated);
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      },
      async addSession(session) {
        const updated = [session, ...sessions];
        setSessions(updated);
        await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
      },
      async clearProfile() {
        setProfileState(null);
        setSessions([]);
        await Promise.all([
          AsyncStorage.removeItem(PROFILE_KEY),
          AsyncStorage.removeItem(SESSIONS_KEY),
        ]);
      },
    }),
    [hydrated, profileState, sessions],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
