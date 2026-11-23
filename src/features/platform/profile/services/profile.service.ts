import { isAxiosError } from 'axios';
import { httpClient } from '@/core/services/http-client.service';

export interface Profile {
  id: string;
  pseudo: string;
  avatar: string | null;
  createdAt: string;
}

export interface ProfileUpdate {
  pseudo: string;
  avatar: string | null;
}

/** Même règle que back-platform : 3 à 20 lettres, chiffres ou tirets. */
export const PSEUDO_PATTERN = /^[A-Za-z0-9-]{3,20}$/;

const PROFILES_URL = '/api/platform/profiles';

/**
 * Renvoie le profil du joueur connecté, en le créant à sa première visite (US-014).
 * Sans danger à rappeler : un profil existant est renvoyé tel quel.
 */
export async function ensureProfile(): Promise<Profile> {
  const { data } = await httpClient.post<Profile>(`${PROFILES_URL}/me`);
  return data;
}

export async function updateProfile(update: ProfileUpdate): Promise<Profile> {
  const { data } = await httpClient.put<Profile>(`${PROFILES_URL}/me`, update);
  return data;
}

export async function getAvatars(): Promise<string[]> {
  const { data } = await httpClient.get<string[]>(`${PROFILES_URL}/avatars`);
  return data;
}

/** Code d'erreur renvoyé par back-platform (`pseudo_taken`, `invalid_pseudo`…), s'il y en a un. */
export function profileErrorCode(error: unknown): string | null {
  if (isAxiosError(error)) {
    const code = (error.response?.data as { error?: unknown } | undefined)?.error;
    return typeof code === 'string' ? code : null;
  }
  return null;
}
