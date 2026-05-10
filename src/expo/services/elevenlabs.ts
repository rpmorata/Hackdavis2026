import { Platform } from 'react-native';
import { inferMimeType, saveAudioBuffer } from './audio';

const API_BASE = 'https://api.elevenlabs.io/v1';

const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
const envVoiceId = process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID;

let cachedDefaultVoiceId: string | null = null;

export interface AudioInput {
  uri: string;
  mimeType?: string;
}

export interface SynthesizeOptions {
  voiceId?: string;
  modelId?: string;
  languageCode?: string;
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  labels?: Record<string, string>;
}

function requireKey(): string {
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_ELEVENLABS_API_KEY is not set. Add it to .env and restart the dev server.');
  }
  return apiKey;
}

export async function listVoices(): Promise<ElevenLabsVoice[]> {
  const key = requireKey();
  const res = await fetch(`${API_BASE}/voices`, {
    headers: { 'xi-api-key': key },
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs listVoices failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { voices?: ElevenLabsVoice[] };
  return json.voices ?? [];
}

async function resolveDefaultVoiceId(): Promise<string> {
  if (envVoiceId) return envVoiceId;
  if (cachedDefaultVoiceId) return cachedDefaultVoiceId;
  const voices = await listVoices();
  if (voices.length === 0) {
    throw new Error('No ElevenLabs voices available on this account. Add one in your ElevenLabs dashboard.');
  }
  cachedDefaultVoiceId = voices[0].voice_id;
  return cachedDefaultVoiceId;
}

export async function transcribe(audio: AudioInput): Promise<string> {
  const key = requireKey();
  const mimeType = audio.mimeType ?? inferMimeType(audio.uri);
  const filename = `recording.${mimeType.split('/')[1] ?? 'm4a'}`;

  const form = new FormData();
  form.append('model_id', 'scribe_v1');

  if (Platform.OS === 'web') {
    const blobRes = await fetch(audio.uri);
    const blob = await blobRes.blob();
    form.append('file', blob, filename);
  } else {
    form.append('file', {
      uri: audio.uri,
      name: filename,
      type: mimeType,
    } as unknown as Blob);
  }

  const res = await fetch(`${API_BASE}/speech-to-text`, {
    method: 'POST',
    headers: { 'xi-api-key': key },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`ElevenLabs STT failed (${res.status}): ${await res.text()}`);
  }

  const json = (await res.json()) as { text?: string };
  if (!json.text) throw new Error('ElevenLabs STT returned no text');
  return json.text;
}

export async function synthesize(text: string, opts: SynthesizeOptions = {}): Promise<string> {
  const key = requireKey();
  const voiceId = opts.voiceId ?? (await resolveDefaultVoiceId());
  const modelId = opts.modelId ?? 'eleven_multilingual_v2';

  const res = await fetch(`${API_BASE}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': key,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      ...(opts.languageCode ? { language_code: opts.languageCode } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`ElevenLabs TTS failed (${res.status}): ${await res.text()}`);
  }

  const buffer = await res.arrayBuffer();
  return saveAudioBuffer(buffer, `tts-${Date.now()}`, 'mp3');
}
