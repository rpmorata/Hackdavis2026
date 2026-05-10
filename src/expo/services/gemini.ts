import { GoogleGenAI, Type } from '@google/genai';
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
