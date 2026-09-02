import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts, Palette, Spacing, Type } from '@/constants/theme';
import { clearHistory, readHistory, type WisdomEntry } from '@/lib/history';

function formatWhen(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<WisdomEntry[]>([]);

  // Re-read on focus: new wisdom is generated on the other tab, so this screen
  // would otherwise show a stale list after the first mount.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      readHistory().then((saved) => {
        if (active) setEntries(saved);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  function confirmClear() {
    Alert.alert('Clear history?', 'This removes every saved piece of wisdom.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          setEntries([]);
        },
      },
    ]);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.lg }]}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        {entries.length > 0 && (
          <Pressable
            onPress={confirmClear}
            accessibilityRole="button"
            hitSlop={Spacing.sm}
            style={({ pressed }) => pressed && styles.pressed}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + Spacing.xl },
          entries.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={
          <Text style={styles.empty}>No wisdom yet. Go ask Grandma.</Text>
        }
        ListFooterComponent={
          entries.length > 0 ? (
            <Text style={styles.disclosure}>Wisdom is AI-generated.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.wisdom}>{item.text}</Text>
            <View style={styles.meta}>
              <Text style={[styles.tone, item.tone === 'funny' && styles.toneFunny]}>
                {item.tone === 'funny' ? 'Funny' : 'Wise'}
              </Text>
              <Text style={styles.when}>{formatWhen(item.createdAt)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: { fontSize: Type.title, fontFamily: Fonts.serif, color: Palette.text },
  clear: { fontSize: Type.label, color: Palette.danger },
  pressed: { opacity: 0.6 },
  list: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  empty: {
    fontSize: Type.body,
    color: Palette.textMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  wisdom: {
    fontSize: Type.body,
    lineHeight: Type.body * 1.5,
    fontFamily: Fonts.serif,
    color: Palette.text,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  tone: {
    fontSize: Type.caption,
    fontWeight: '600',
    color: Palette.accent,
    backgroundColor: Palette.accentSoft,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toneFunny: { color: Palette.danger, backgroundColor: '#F5E7E2' },
  when: { fontSize: Type.caption, color: Palette.textMuted },
  disclosure: {
    fontSize: Type.caption,
    color: Palette.textMuted,
    textAlign: 'center',
    paddingTop: Spacing.sm,
  },
});
