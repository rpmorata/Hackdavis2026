import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PatientProfile {
  name: string;
  language: string;
  dialect?: string;
  healthLiteracy: 'fluent' | 'some' | 'audio';
  medicalTerminology: 'clinical' | 'plain' | 'simple';
  culturalBackground: string;
  timeInUS: string;
  westernMedicineFamiliarity: string;
  religion?: string;
  religiousConsiderations?: string[];
  decisionMaker: 'myself' | 'shared' | 'family';
  familyMode: boolean;
  familyName?: string;
  medicalTrust: string;
  sensitiveTopics?: string[];
  communicationTone: 'direct' | 'warm' | 'gentle';
  outputFormat: 'voice' | 'text' | 'both';
  fontSize: 'normal' | 'large' | 'xlarge';
  onboardingComplete: boolean;
}

export interface SessionEntry {
  id: string;
  date: string;
  title: string;
  originalText: string;
  translatedText: string;
  culturalNote?: string;
}

interface ProfileContextType {
  profile: PatientProfile | null;
  setProfile: (profile: PatientProfile) => void;
  updateProfile: (updates: Partial<PatientProfile>) => void;
  sessions: SessionEntry[];
  addSession: (session: SessionEntry) => void;
  clearProfile: () => void;
}

const mockSessions: SessionEntry[] = [
  {
    id: '1',
    date: 'May 9, 2026',
    title: 'Cardiology Appointment',
    originalText:
      "Your blood pressure is 140 over 90. This is stage 2 hypertension. I'm going to prescribe Lisinopril, 10 milligrams once a day.",
    translatedText:
      'Su presión arterial es 140 sobre 90. Esto es hipertensión de etapa 2. Le voy a recetar Lisinopril, 10 miligramos una vez al día.',
    culturalNote:
      'Su esposo también podría querer escuchar esta información. Con apoyo familiar y atención médica, muchas personas manejan esta condición muy bien.',
  },
  {
    id: '2',
    date: 'May 6, 2026',
    title: 'Prescription Consultation',
    originalText:
      'Metformin helps control your blood sugar levels. Take it with meals to reduce stomach upset.',
    translatedText:
      'La Metformina ayuda a controlar sus niveles de azúcar en la sangre. Tómela con las comidas para reducir el malestar estomacal.',
  },
  {
    id: '3',
    date: 'May 2, 2026',
    title: 'Diabetes Follow-Up',
    originalText:
      'Your A1C levels have improved significantly. Keep monitoring your blood sugar daily.',
    translatedText:
      'Sus niveles de A1C han mejorado significativamente. Continúe monitoreando su azúcar en la sangre a diario.',
  },
];

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<PatientProfile | null>(() => {
    try {
      const stored = localStorage.getItem('claritymd_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [sessions, setSessions] = useState<SessionEntry[]>(() => {
    try {
      const stored = localStorage.getItem('claritymd_sessions');
      return stored ? JSON.parse(stored) : mockSessions;
    } catch {
      return mockSessions;
    }
  });

  const setProfile = (p: PatientProfile) => {
    setProfileState(p);
    localStorage.setItem('claritymd_profile', JSON.stringify(p));
  };

  const updateProfile = (updates: Partial<PatientProfile>) => {
    setProfileState((prev) => {
      const base = prev ?? ({} as PatientProfile);
      const updated = { ...base, ...updates };
      localStorage.setItem('claritymd_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const addSession = (session: SessionEntry) => {
    setSessions((prev) => {
      const updated = [session, ...prev];
      localStorage.setItem('claritymd_sessions', JSON.stringify(updated));
      return updated;
    });
  };

  const clearProfile = () => {
    setProfileState(null);
    localStorage.removeItem('claritymd_profile');
  };

  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, updateProfile, sessions, addSession, clearProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
