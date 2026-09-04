import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'grandmas-wisdom:history';
const MAX_ENTRIES = 100;

/** The two moods the app offers, shared by the wisdom, history and settings screens. */
export type Tone = 'funny' | 'wise';

export type WisdomEntry = {
  id: string;
  tone: Tone;
  text: string;
  createdAt: number;
  /**
   * Marks the stored text as machine-written. Optional on read so entries
   * saved before this field existed still load, always written going forward.
   */
  aiGenerated?: boolean;
};

/**
 * What a read of storage actually found. `unreadable` is not the same as an
 * empty history: it means there is something there we could not parse, or the
 * store would not answer at all.
 */
export type HistoryState =
  | { status: 'ready'; entries: WisdomEntry[] }
  | { status: 'unreadable' };

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
 * Every write goes through here, one at a time.
 *
 * `addEntry` is read-modify-write and `clearHistory` is a delete, and nothing
 * used to stop them interleaving. A cross-model review found the consequence:
 * if `addEntry` had already read the list when a clear landed, its own write
 * put the whole deleted history back, plus the new entry -- a destructive
 * action the user confirmed, silently undone. Serialising the mutations is
 * enough here; there is one producer and one consumer, both in this process.
 */
let mutations: Promise<unknown> = Promise.resolve();

function serialize<T>(operation: () => Promise<T>): Promise<T> {
  // Chain off settled, not resolved: one failed mutation must not wedge the
  // queue for every mutation after it.
  const run = mutations.then(operation, operation);
  mutations = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

/** Read storage and say what was actually there. */
async function read(): Promise<HistoryState> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    // The store would not answer. Saying "empty" here would be a guess.
    return { status: 'unreadable' };
  }

  if (!raw) return { status: 'ready', entries: [] };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { status: 'unreadable' };
    const entries = parsed.filter(isEntry);
    // Something was stored, and none of it survived validation. That is
    // corruption, not an empty history.
    if (parsed.length > 0 && entries.length === 0) return { status: 'unreadable' };
    return { status: 'ready', entries };
  } catch {
    return { status: 'unreadable' };
  }
}

/**
 * Read the saved history, newest first.
 *
 * Storage is shared with earlier versions of this app and can be edited or
 * corrupted outside our control, so every entry is validated rather than
 * trusted. A bad record is dropped instead of crashing the screen. Callers that
 * need to tell "nothing saved" from "could not read" should use
 * `readHistoryState` instead.
 */
export async function readHistory(): Promise<WisdomEntry[]> {
  const state = await read();
  return state.status === 'ready' ? state.entries : [];
}

/**
 * Like `readHistory`, but keeps the distinction between an empty history and a
 * broken one.
 *
 * The Settings screen needs it: clearing is the only way out of corrupt
 * storage, and treating an unreadable store as empty disabled that button
 * exactly when it was the one thing worth pressing.
 */
export async function readHistoryState(): Promise<HistoryState> {
  return read();
}

/** Prepend an entry and persist. Returns the new list so callers can render it. */
export async function addEntry(tone: Tone, text: string): Promise<WisdomEntry[]> {
  const entry: WisdomEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tone,
    text,
    createdAt: Date.now(),
    aiGenerated: true,
  };

  return serialize(async () => {
    const next = [entry, ...(await readHistory())].slice(0, MAX_ENTRIES);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Persisting is a convenience. If the write fails the user still has the
      // wisdom on screen, so this must not surface as an error.
    }
    return next;
  });
}

/**
 * Erase the saved history. Returns whether the write actually succeeded.
 *
 * It used to swallow the failure and resolve `void`, which left callers unable
 * to tell "cleared" from "silently did nothing" -- a bad property behind a
 * destructive confirmation that promises the action cannot be undone.
 */
export async function clearHistory(): Promise<boolean> {
  return serialize(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  });
}
