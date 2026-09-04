import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Palette, Spacing, Type } from '@/constants/theme';

/** The exact wording, in one place, so it cannot drift between screens. */
const LINE = 'Wisdom is AI-generated.';

/**
 * The AI-disclosure line, wrapped around the AI output it describes.
 *
 * It takes children rather than standing alone on purpose. `CLAUDE.md` requires
 * the line to sit *above* the output it labels, because a label that follows
 * its content can be scrolled past unseen -- an audit caught exactly that on
 * the History screen, where it was a list footer sitting after up to a hundred
 * entries. As a plain component that rule stays a convention every screen has
 * to remember. As a wrapper it is structural: there is no way to put content
 * above the label without moving that content out of the component.
 *
 * `style` shapes the wrapper's own layout -- flex, gutters -- and deliberately
 * cannot restyle the line itself. Two screens carrying two slightly different
 * versions of this label is the drift the extraction exists to end.
 *
 * Render it around AI output only. A screen with none does not need it, and
 * `CLAUDE.md` is explicit that it must never become a settings page, a modal or
 * a dismissable banner.
 */
export function Disclosure({
  children,
  style,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.line} accessibilityRole="text">
        {LINE}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // The gap replaces what each screen used to add by hand -- a margin below the
  // line on one, a container gap on the other.
  wrap: { gap: Spacing.md },
  line: {
    fontSize: Type.caption,
    color: Palette.disclosure,
    textAlign: 'center',
  },
});
