import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts, Palette, Spacing, Type } from '@/constants/theme';
import { clearHistory, readHistory, type Tone } from '@/lib/history';
import { readDefaultTone, writeDefaultTone } from '@/lib/settings';

// The same strings the Wisdom screen offers, deliberately not reworded: two
// different descriptions of one setting is how a screen starts lying about
// what it does.
const TONES: { value: Tone; label: string; hint: string }[] = [
  { value: 'wise', label: 'Wise', hint: 'Something calm and genuinely useful' },
  { value: 'funny', label: 'Funny', hint: 'Advice, right up until the last word' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [tone, setTone] = useState<Tone>('wise');
  const [saved, setSaved] = useState(0);

  useEffect(() => {
    let active = true;
    readDefaultTone().then((stored) => {
      if (active) setTone(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  // The count is generated on another tab, so re-read on focus for the same
  // reason the History screen does.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      readHistory().then((entries) => {
        if (active) setSaved(entries.length);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  function pickTone(next: Tone) {
    // State first, storage after: the radio must move under the finger even if
    // the write never lands.
    setTone(next);
    void writeDefaultTone(next);
  }

  async function doClear() {
    await clearHistory();
    // Not setSaved(0): clearHistory swallows its own storage failure and
    // resolves either way, so assuming success would grey this row out while
    // the History tab still lists every entry. Re-read and show what is
    // actually there.
    setSaved((await readHistory()).length);
  }

  function confirmClear() {
    const title = 'Clear history?';
    const message = `This removes all ${saved} ${
      saved === 1 ? 'saying' : 'sayings'
    } from this phone. It cannot be undone.`;
    // Alert.alert is a no-op on react-native-web, so on web the row would
    // silently do nothing at all.
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) void doClear();
      return;
    }
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear history', style: 'destructive', onPress: () => void doClear() },
    ]);
  }

  const nothingSaved = saved === 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
      ]}>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.sectionLabel}>Wisdom</Text>
      <View style={styles.group} accessibilityRole="radiogroup">
        {TONES.map(({ value, label, hint }) => {
          const selected = tone === value;
          return (
            <Pressable
              key={value}
              onPress={() => pickTone(value)}
              accessibilityRole="radio"
              // A radio's checked state comes from `checked`; with only
              // `selected` set the row is never announced as checkable.
              accessibilityState={{ checked: selected, selected }}
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

      <Text style={[styles.sectionLabel, styles.sectionGap]}>History</Text>
      <Pressable
        onPress={confirmClear}
        disabled={nothingSaved}
        accessibilityRole="button"
        accessibilityState={{ disabled: nothingSaved }}
        accessibilityHint={nothingSaved ? undefined : 'Asks you to confirm before deleting'}
        style={({ pressed }) => [
          styles.clearRow,
          pressed && !nothingSaved && styles.pressed,
        ]}>
        <Text style={[styles.clearLabel, nothingSaved && styles.clearLabelDisabled]}>
          Clear history
        </Text>
        <Text style={styles.clearCount}>
          {nothingSaved ? 'Nothing saved yet' : `${saved} saved`}
        </Text>
      </Pressable>

      <Text style={[styles.sectionLabel, styles.sectionGap]}>About</Text>
      {/*
        No AI-disclosure line on this screen, on purpose: it renders no model
        output. This paragraph explains the label the other two screens carry
        above their output -- it does not stand in for it. Moving the
        disclosure here would be the exact failure an earlier audit caught.
      */}
      <Text style={styles.about}>
        Grandma&apos;s Wisdom gives you one line of wisdom at a time.
      </Text>
      <Text style={styles.about}>
        The wisdom is written by an AI model. That is why the Wisdom and History
        screens carry a label saying so — it is there to meet the EU AI Act
        transparency duty.
      </Text>
      <Text style={styles.about}>
        Your history stays on this phone. The key that talks to the model stays on
        the server and never reaches the app.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: Spacing.lg },
  title: {
    fontSize: Type.title,
    fontFamily: Fonts.serif,
    color: Palette.text,
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: Type.caption,
    fontWeight: '600',
    // The design's .06em, resolved against the caption size. React Native takes
    // letter spacing in points, not ems, so it cannot track the font size on
    // its own.
    letterSpacing: Type.caption * 0.06,
    textTransform: 'uppercase',
    color: Palette.textMuted,
    marginBottom: Spacing.sm,
  },
  sectionGap: { marginTop: Spacing.xl },
  group: { gap: Spacing.sm },

  // Lifted from the Wisdom screen rather than reinvented: same geometry, same
  // colours, so the two radio groups cannot drift apart.
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

  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  // Disabled reads as disabled rather than as broken: the row keeps its surface
  // and border at full strength, and only the destructive label gives up its
  // colour. Deliberately not an opacity fade on top of that -- the two stack,
  // and fading Palette.textMuted to 60% takes "Nothing saved yet" from 6.35:1
  // on surface to roughly 3:1. That line is the only thing explaining why the
  // row is inert, so it is the last thing that should get hard to read.
  clearLabel: { fontSize: Type.label, fontWeight: '600', color: Palette.danger },
  clearLabelDisabled: { color: Palette.textMuted },
  clearCount: { fontSize: Type.caption, color: Palette.textMuted },

  about: {
    fontSize: Type.body,
    lineHeight: Type.body * 1.55,
    color: Palette.text,
    marginBottom: Spacing.sm,
  },
  pressed: { opacity: 0.85 },
});
