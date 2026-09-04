import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Tone } from '@/lib/history';

const STORAGE_KEY = 'grandmas-wisdom:default-tone';

const DEFAULT_TONE: Tone = 'wise';

/**
 * Read the tone the Wisdom screen should start on.
 *
 * Like the history store, this is shared with earlier versions of the app and
 * can be edited outside our control, so the stored string is checked rather
 * than cast. Anything unrecognised falls back to the default instead of
 * putting an invalid tone into a request body.
 */
export async function readDefaultTone(): Promise<Tone> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw === 'funny' || raw === 'wise' ? raw : DEFAULT_TONE;
  } catch {
    return DEFAULT_TONE;
  }
}

/**
 * Persist the default tone.
 *
 * Deliberately returns nothing and swallows its failure. The Settings screen
 * updates its own state first and treats the write as a convenience, so a full
 * disk shows the choice as taken for this session rather than as an error the
 * user cannot act on.
 */
export async function writeDefaultTone(tone: Tone): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, tone);
  } catch {
    // Nothing useful to do; the next read falls back to the default.
  }
}
