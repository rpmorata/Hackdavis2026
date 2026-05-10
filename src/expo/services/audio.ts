import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const EXT_TO_MIME: Record<string, string> = {
  mp3: 'audio/mpeg',
  m4a: 'audio/m4a',
  wav: 'audio/wav',
  webm: 'audio/webm',
  ogg: 'audio/ogg',
  '3gp': 'audio/3gpp',
};

export function inferMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  for (const [ext, mime] of Object.entries(EXT_TO_MIME)) {
    if (lower.endsWith(`.${ext}`)) return mime;
  }
  return 'audio/m4a';
}

export function releaseAudioUri(uri: string | null | undefined): void {
  if (!uri) return;
  if (Platform.OS === 'web' && uri.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(uri);
    } catch {
      // best-effort; nothing to do if it's already revoked
    }
  }
}

export async function saveAudioBuffer(buffer: ArrayBuffer, name: string, ext: string): Promise<string> {
  if (Platform.OS === 'web') {
    const blob = new Blob([buffer], { type: EXT_TO_MIME[ext] ?? 'application/octet-stream' });
    return URL.createObjectURL(blob);
  }
  const path = `${FileSystem.cacheDirectory}${name}.${ext}`;
  const base64 = arrayBufferToBase64(buffer);
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return path;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return globalThis.btoa(binary);
}
