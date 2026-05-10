import { PatientProfile } from '../types';

const API_BASE = 'https://app.backboard.io/api';
const API_URL = `${API_BASE}/threads/messages`;

const apiKey = process.env.EXPO_PUBLIC_BACKBOARD_API_KEY;
const llmProvider = process.env.EXPO_PUBLIC_BACKBOARD_PROVIDER ?? 'featherless';
const modelName = process.env.EXPO_PUBLIC_BACKBOARD_MODEL ?? 'aaditya/Llama3-OpenBioLLM-70B';

export interface BackboardModel {
  name: string;
  provider: string;
  model_type?: string;
  context_limit?: number;
}

export interface MedicationInfo {
  name: string;
  use: string;
  how: string;
  sideEffects: string[];
  warning: string;
  unknown?: boolean;
}

const TERMINOLOGY_GUIDANCE: Record<PatientProfile['medicalTerminology'], string> = {
  clinical: 'Preserve clinical terms. Add a brief plain-language gloss after each.',
  plain: 'Patient-friendly language. Define any unavoidable clinical terms in parentheses.',
  simple: '5th-grade reading level. Replace clinical terms with everyday equivalents. Short sentences.',
};

const TONE_GUIDANCE: Record<PatientProfile['communicationTone'], string> = {
  direct: 'Direct and matter-of-fact. No softening language.',
  warm: 'Warm and reassuring without being saccharine.',
  gentle: 'Gentle and emotionally aware.',
};

function requireKey(): string {
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_BACKBOARD_API_KEY is not set. Add it to .env and restart the dev server.');
  }
  return apiKey;
}

export async function listProviders(): Promise<string[]> {
  const key = requireKey();
  const res = await fetch(`${API_BASE}/models/providers`, {
    headers: { 'X-API-Key': key },
  });
  if (!res.ok) {
    throw new Error(`Backboard listProviders failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { providers?: string[] };
  return json.providers ?? [];
}

export async function listModels(provider: string, limit = 200): Promise<BackboardModel[]> {
  const key = requireKey();
  const res = await fetch(`${API_BASE}/models/provider/${encodeURIComponent(provider)}?limit=${limit}`, {
    headers: { 'X-API-Key': key },
  });
  if (!res.ok) {
    throw new Error(`Backboard listModels failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { models?: BackboardModel[] };
  return json.models ?? [];
}

function buildPrompt(query: string, profile: PatientProfile | null): string {
  const language = profile?.language ?? 'English';
  const terminology = profile?.medicalTerminology ?? 'plain';
  const tone = profile?.communicationTone ?? 'warm';

  return [
    'You are a medical assistant explaining a medication to a patient.',
    `Target language: ${language}. Write every field of your response in ${language}.`,
    `Reading level: ${TERMINOLOGY_GUIDANCE[terminology]}`,
    `Tone: ${TONE_GUIDANCE[tone]}`,
    'Preserve clinical accuracy: do not invent dosages, frequencies, or contraindications.',
    '',
    'Return ONLY a single JSON object with these exact fields. No markdown, no fences, no commentary before or after:',
    '{',
    '  "name": "canonical medication name",',
    '  "use": "One sentence on what this medication is used for.",',
    '  "how": "One or two sentences on how to take it (timing, food, special handling).",',
    '  "sideEffects": ["3 to 5 short strings of the most common side effects"],',
    '  "warning": "One sentence on when to seek urgent medical care.",',
    '  "unknown": false',
    '}',
    'If the query is not a medication or you do not have reliable information, set "unknown": true and leave the other fields as empty strings or empty array.',
    '',
    `Medication query: ${query}`,
  ].join('\n');
}

function extractJson(raw: string): string {
  const stripped = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const match = stripped.match(/\{[\s\S]*\}/);
  return match ? match[0] : stripped;
}

export async function askMedication(query: string, profile: PatientProfile | null): Promise<MedicationInfo> {
  const key = requireKey();

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'X-API-Key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: buildPrompt(query, profile),
      llm_provider: llmProvider,
      model_name: modelName,
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`Backboard request failed (${res.status}): ${await res.text()}`);
  }

  const body = (await res.json()) as { content?: string };
  if (!body.content) throw new Error('Backboard returned empty content');

  if (/^\s*LLM\s*(API\s*)?Error/i.test(body.content)) {
    throw new Error(`Backboard upstream LLM error: ${body.content.slice(0, 400)}`);
  }

  let parsed: Partial<MedicationInfo>;
  try {
    parsed = JSON.parse(extractJson(body.content)) as Partial<MedicationInfo>;
  } catch (err) {
    throw new Error(`Could not parse Backboard JSON response: ${body.content.slice(0, 200)}`);
  }

  return {
    name: parsed.name ?? query,
    use: parsed.use ?? '',
    how: parsed.how ?? '',
    sideEffects: Array.isArray(parsed.sideEffects) ? parsed.sideEffects : [],
    warning: parsed.warning ?? '',
    unknown: Boolean(parsed.unknown),
  };
}
