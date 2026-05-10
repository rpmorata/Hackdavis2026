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

const mockSessions: SessionEntry[] = [
  {
    id: '1',
    date: 'May 9, 2026',
    title: 'Cardiology Appointment',
    originalText:
      "Your blood pressure is 140 over 90. This is stage 2 hypertension. I'm going to prescribe Lisinopril, 10 milligrams once a day.",
    translatedText:
      'Su presion arterial es 140 sobre 90. Esto es hipertension de etapa 2. Le voy a recetar Lisinopril, 10 miligramos una vez al dia.',
    culturalNote:
      'Su esposo tambien podria querer escuchar esta informacion. Con apoyo familiar y atencion medica, muchas personas manejan esta condicion muy bien.',
  },
  {
    id: '2',
    date: 'May 6, 2026',
    title: 'Prescription Consultation',
    originalText: 'Metformin helps control your blood sugar levels. Take it with meals to reduce stomach upset.',
    translatedText:
      'La Metformina ayuda a controlar sus niveles de azucar en la sangre. Tomela con las comidas para reducir el malestar estomacal.',
  },
  {
    id: '3',
    date: 'May 2, 2026',
    title: 'Diabetes Follow-Up',
    originalText: 'Your A1C levels have improved significantly. Keep monitoring your blood sugar daily.',
    translatedText:
      'Sus niveles de A1C han mejorado significativamente. Continue monitoreando su azucar en la sangre a diario.',
  },
];

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [profileState, setProfileState] = useState<PatientProfile | null>(null);
  const [sessions, setSessions] = useState<SessionEntry[]>(mockSessions);

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
        await AsyncStorage.removeItem(PROFILE_KEY);
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
