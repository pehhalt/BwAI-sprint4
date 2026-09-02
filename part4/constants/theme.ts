/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

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
  textMuted: '#8A7A69',
  accent: '#6E8B6A', // sage
  accentText: '#FFFFFF',
  accentSoft: '#EAF0E8',
  danger: '#A85A46',
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
