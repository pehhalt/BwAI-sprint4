import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts, Palette, Spacing, Type } from '@/constants/theme';
import { apiUrl } from '@/lib/api';
import { addEntry, type Tone } from '@/lib/history';
import { readDefaultTone } from '@/lib/settings';

const TONES: { value: Tone; label: string; hint: string }[] = [
  { value: 'wise', label: 'Wise', hint: 'Something calm and genuinely useful' },
  { value: 'funny', label: 'Funny', hint: 'Advice, right up until the last word' },
];

export default function WisdomScreen() {
  const insets = useSafeAreaInsets();
  const [tone, setTone] = useState<Tone>('wise');
  const [wisdom, setWisdom] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Once, on mount, not on focus. This is the tone the screen *starts* on --
  // re-reading every time the tab regains focus would silently undo a pick the
  // user just made here.
  useEffect(() => {
    let active = true;
    readDefaultTone().then((stored) => {
      if (active) setTone(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  const UNREACHABLE = "Grandma couldn't be reached. Try again in a moment.";

  async function askGrandma() {
    setLoading(true);
    setError(null);
    // Clear the old answer up front, so a failure never leaves the previous
    // wisdom sitting under an error message as though it were the new one.
    setWisdom(null);
    try {
      const response = await fetch(apiUrl('/api/wisdom'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Show what the server actually said. Its error strings are written
        // for a reader and carry no key or account detail by design, and the
        // likeliest first-run failure -- a missing key -- needs a setup fix,
        // not the retry that a generic "couldn't be reached" invites.
        setError(data?.error ?? UNREACHABLE);
        return;
      }

      setWisdom(data.wisdom);
      // Saving is a convenience, not part of the result: addEntry swallows its
      // own storage failures so a full disk cannot turn a good answer into an
      // error on screen.
      await addEntry(tone, data.wisdom);
    } catch {
      // Genuine network or parse failure: there is no server message to show.
      setError(UNREACHABLE);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
      ]}>
      <Text style={styles.title}>Grandma&apos;s Wisdom</Text>
      <Text style={styles.subtitle}>of the day</Text>

      <View style={styles.group} accessibilityRole="radiogroup">
        {TONES.map(({ value, label, hint }) => {
          const selected = tone === value;
          return (
            <Pressable
              key={value}
              onPress={() => setTone(value)}
              disabled={loading}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: loading }}
              accessibilityLabel={`${label}. ${hint}`}
              style={({ pressed }) => [
                styles.radioRow,
                selected && styles.radioRowSelected,
                pressed && styles.pressed,
              ]}>
              <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                {selected ? <View style={styles.radioInner} /> : null}
              </View>
              <View style={styles.radioTextWrap}>
                <Text style={styles.radioLabel}>{label}</Text>
                <Text style={styles.radioHint}>{hint}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={askGrandma}
        disabled={loading}
        accessibilityRole="button"
        accessibilityState={{ disabled: loading, busy: loading }}
        style={({ pressed }) => [
          styles.button,
          loading && styles.buttonDisabled,
          pressed && !loading && styles.pressed,
        ]}>
        {loading ? (
          <View style={styles.buttonBusy}>
            <ActivityIndicator color={Palette.accentText} />
            <Text style={styles.buttonText}>Grandma is thinking…</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Ask Grandma</Text>
        )}
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/*
        Above the card, not below it: a label that follows the content it
        labels can be scrolled past unseen. EU AI Act Article 50 asks for
        disclosure at or before the interaction, so it reads first.
      */}
      <Text style={styles.disclosure} accessibilityRole="text">
        Wisdom is AI-generated.
      </Text>

      {wisdom ? (
        <View style={styles.card}>
          <Text style={styles.wisdom}>{wisdom}</Text>
        </View>
      ) : (
        !error && <Text style={styles.empty}>Pick a mood and ask. She always has something.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  title: {
    fontSize: Type.title,
    fontFamily: Fonts.serif,
    color: Palette.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Type.body,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
  group: { gap: Spacing.sm },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  radioRowSelected: { borderColor: Palette.accent, backgroundColor: Palette.accentSoft },
  radioOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Palette.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: Palette.accent },
  radioInner: { width: 13, height: 13, borderRadius: 7, backgroundColor: Palette.accent },
  radioTextWrap: { flex: 1 },
  radioLabel: { fontSize: Type.label, fontWeight: '600', color: Palette.text },
  radioHint: { fontSize: Type.caption, color: Palette.textMuted, marginTop: 2 },
  button: {
    backgroundColor: Palette.accent,
    borderRadius: 14,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  buttonDisabled: { opacity: 0.75 },
  buttonBusy: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  buttonText: { color: Palette.accentText, fontSize: Type.button, fontWeight: '600' },
  pressed: { opacity: 0.85 },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Spacing.lg,
  },
  wisdom: {
    fontSize: Type.wisdom,
    lineHeight: Type.wisdom * 1.45,
    fontFamily: Fonts.serif,
    color: Palette.text,
  },
  empty: {
    fontSize: Type.body,
    color: Palette.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  error: { fontSize: Type.body, color: Palette.danger, textAlign: 'center' },
  disclosure: {
    fontSize: Type.caption,
    color: Palette.disclosure,
    textAlign: 'center',
  },
});
