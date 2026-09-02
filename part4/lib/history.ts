import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'grandmas-wisdom:history';
const MAX_ENTRIES = 100;

export type WisdomEntry = {
  id: string;
  tone: 'funny' | 'wise';
  text: string;
  createdAt: number;
  /**
   * Marks the stored text as machine-written. Optional on read so entries
   * saved before this field existed still load, always written going forward.
   */
  aiGenerated?: boolean;
};

function isEntry(value: unknown): value is WisdomEntry {
  const e = value as Partial<WisdomEntry> | null;
  return (
    !!e &&
    typeof e.id === 'string' &&
    typeof e.text === 'string' &&
    typeof e.createdAt === 'number' &&
    (e.tone === 'funny' || e.tone === 'wise')
  );
}

/**
 * Read the saved history, newest first.
 *
 * Storage is shared with earlier versions of this app and can be edited or
 * corrupted outside our control, so every entry is validated rather than
 * trusted. A bad record is dropped instead of crashing the screen.
 */
export async function readHistory(): Promise<WisdomEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
}

/** Prepend an entry and persist. Returns the new list so callers can render it. */
export async function addEntry(
  tone: WisdomEntry['tone'],
  text: string
): Promise<WisdomEntry[]> {
  const entry: WisdomEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tone,
    text,
    createdAt: Date.now(),
    aiGenerated: true,
  };
  const next = [entry, ...(await readHistory())].slice(0, MAX_ENTRIES);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Persisting is a convenience. If the write fails the user still has the
    // wisdom on screen, so this must not surface as an error.
  }
  return next;
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing useful to do; the next read falls back to an empty list.
  }
}
