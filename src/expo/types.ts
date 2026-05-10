export type RouteName = 'welcome' | 'onboarding' | 'home' | 'session' | 'medication' | 'profile';

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
  audioUri?: string;
}
