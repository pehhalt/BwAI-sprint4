/**
 * Design tokens. The light/dark `Colors` table the Expo template ships was
 * removed with the unused components that consumed it -- this app commits to
 * one light palette, and leaving a dark table around invites a change back to
 * system theming that CLAUDE.md rules out.
 */

import { Platform } from 'react-native';

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/**
 * Grandma's Wisdom design tokens.
 *
 * The app deliberately commits to one warm, calm look instead of following the
 * system light/dark setting. The screen is essentially a single quote on paper,
 * and a dark variant of that reads as a different app rather than the same one
 * at night. Screens pull every colour, size and gap from here — no hardcoded
 * hex values or magic numbers in components.
 */
export const Palette = {
  background: '#FAF4E8', // warm cream, like old paper
  surface: '#FFFDF8',
  border: '#E7DCC6',
  text: '#3E2F23', // deep warm brown
  textMuted: '#6E5B49', // 5.89:1 on background, 6.35:1 on surface
  // Secondary text sits at 5.89:1 and the disclosure a shade darker at 6.5:1.
  // The previous #8A7A69 measured 3.78:1, under the 4.5:1 WCAG AA floor -- and
  // it was used for subtitles, hints and timestamps, not just this line.
  disclosure: '#665545',
  accent: '#6E8B6A', // sage
  accentText: '#FFFFFF',
  accentSoft: '#EAF0E8',
  danger: '#A85A46',
  // The "funny" tone's soft background. Lived as a literal in history.tsx
  // until a cross-model review caught it against the no-hex-in-screens rule.
  // Its contrast against danger is 4.13:1, which fails AA for 14px text --
  // tokenising it does not fix that, and the fix is tracked separately.
  dangerSoft: '#F5E7E2',
};

export const Spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 36 };

/** Larger than a typical app: this is meant to be read at arm's length. */
export const Type = {
  caption: 14,
  label: 17,
  body: 18,
  button: 20,
  wisdom: 25,
  title: 34,
};
