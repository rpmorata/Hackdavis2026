import { GoogleGenAI, Type } from '@google/genai';
import type { MedicationInfo } from './backboard';
import { PatientProfile } from '../types';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_GEMINI_API_KEY is not set. Add it to .env and restart the dev server.');
  }
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

export interface SimplifyInput {
  text: string;
  profile: Pick<
    PatientProfile,
    | 'language'
    | 'medicalTerminology'
    | 'communicationTone'
    | 'healthLiteracy'
    | 'culturalBackground'
    | 'religiousConsiderations'
    | 'decisionMaker'
  > | null;
}

export interface SimplifyResult {
  simplified: string;
  culturalNote?: string;
}

const TERMINOLOGY_GUIDANCE: Record<PatientProfile['medicalTerminology'], string> = {
  clinical: 'Keep medical terminology intact. Brief one-line plain-language gloss after each clinical term.',
  plain: 'Use plain language. Keep clinical terms only when they are unavoidable, and define them in parentheses.',
  simple: 'Write at a 5th-grade reading level. Replace every Latin/Greek/clinical term with everyday equivalents. Short sentences.',
};

const TONE_GUIDANCE: Record<PatientProfile['communicationTone'], string> = {
  direct: 'Direct and matter-of-fact. No softening language.',
  warm: 'Warm and reassuring without being saccharine.',
  gentle: 'Gentle and emotionally aware. Acknowledge uncertainty and worry where appropriate.',
};

function buildSystemInstruction(profile: SimplifyInput['profile']): string {
  const language = profile?.language ?? 'English';
  const terminology = profile?.medicalTerminology ?? 'plain';
  const tone = profile?.communicationTone ?? 'warm';

  const lines: string[] = [
    'You translate clinician speech into patient-friendly explanations for a medical-translation app.',
    `Target language: ${language}. Output the simplified explanation in ${language} only.`,
    `Terminology level: ${TERMINOLOGY_GUIDANCE[terminology]}`,
    `Tone: ${TONE_GUIDANCE[tone]}`,
    'Preserve every clinical fact exactly: medication names, dosages, frequencies, numbers, and units. Never invent or change them.',
    'Do not add medical advice that the clinician did not say. Do not diagnose.',
    'If the source contains nothing translatable, return the input unchanged in the target language.',
  ];

  if (profile?.culturalBackground) {
    lines.push(`Patient cultural background: ${profile.culturalBackground}.`);
  }
  if (profile?.religiousConsiderations?.length) {
    lines.push(`Religious considerations to respect: ${profile.religiousConsiderations.join(', ')}.`);
  }
  if (profile?.decisionMaker && profile.decisionMaker !== 'myself') {
    lines.push(
      `The patient shares medical decisions with family. If relevant, include a short culturalNote suggesting they share this with the family member or caregiver who helps with decisions.`,
    );
  }

  lines.push(
    'Optionally include a culturalNote field (in the target language) only when there is something genuinely useful to add about cultural or family context. Otherwise omit it.',
  );

  return lines.join('\n');
}

const ENGLISH_MED_SECTION_TITLES = {
  use: 'What this medication does',
  how: 'How and when to take it',
  sideEffects: 'Common side effects (usually not dangerous)',
  warning: 'Call your doctor if you notice…',
};

export async function translateMedicationInfo(
  info: MedicationInfo,
  profile: PatientProfile | null,
): Promise<MedicationInfo> {
  const ai = getClient();
  const language = profile?.language ?? 'English';

  const systemInstruction = [
    `You translate medical content from English into ${language}.`,
    `Translate every text field naturally into ${language}, including the section titles.`,
    'Preserve every clinical fact exactly: medication names, dosages, frequencies, numbers, and units. Never invent or change them.',
    'Keep canonical drug names (e.g. "Metformin", "Lisinopril") in their standard form unless an established translation exists in the target language.',
    'If a string field is empty in the source, leave it empty in the output. If sideEffects is empty, return an empty array.',
  ].join('\n');

  const userPrompt = JSON.stringify({
    name: info.name,
    description: info.description ?? '',
    schedule: info.schedule ?? '',
    use: info.use,
    how: info.how,
    sideEffects: info.sideEffects,
    warning: info.warning,
    sectionTitles: ENGLISH_MED_SECTION_TITLES,
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING, nullable: true },
          schedule: { type: Type.STRING, nullable: true },
          use: { type: Type.STRING },
          how: { type: Type.STRING },
          sideEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
          warning: { type: Type.STRING },
          sectionTitles: {
            type: Type.OBJECT,
            properties: {
              use: { type: Type.STRING },
              how: { type: Type.STRING },
              sideEffects: { type: Type.STRING },
              warning: { type: Type.STRING },
            },
            required: ['use', 'how', 'sideEffects', 'warning'],
          },
        },
        required: ['name', 'use', 'how', 'sideEffects', 'warning', 'sectionTitles'],
      },
    },
  });

  const raw = response.text;
  if (!raw) throw new Error('Gemini returned empty translation response');

  const parsed = JSON.parse(raw) as MedicationInfo;
  return {
    name: parsed.name || info.name,
    description: parsed.description || undefined,
    schedule: parsed.schedule || undefined,
    use: parsed.use ?? '',
    how: parsed.how ?? '',
    sideEffects: Array.isArray(parsed.sideEffects) ? parsed.sideEffects : [],
    warning: parsed.warning ?? '',
    sectionTitles: parsed.sectionTitles,
    unknown: false,
  };
}

export async function simplifyAndTranslate(input: SimplifyInput): Promise<SimplifyResult> {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: input.text,
    config: {
      systemInstruction: buildSystemInstruction(input.profile),
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          simplified: { type: Type.STRING },
          culturalNote: { type: Type.STRING, nullable: true },
        },
        required: ['simplified'],
      },
    },
  });

  const raw = response.text;
  if (!raw) throw new Error('Gemini returned empty response');

  const parsed = JSON.parse(raw) as { simplified: string; culturalNote?: string | null };
  return {
    simplified: parsed.simplified,
    culturalNote: parsed.culturalNote ?? undefined,
  };
}
