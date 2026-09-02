import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const BACKGROUND = '#111A2B';
const TITLE = '#F5F2EC';
const MUTED = '#7C899F';
const HINT = '#5A6478';
const ACCENT = '#F0A85C';
const ACCENT_TEXT = '#2A1B06';

const TILT_MS = 40; // initial tip, before the wobble
const WOBBLE_MS = 70; // one swing, left to right
const WOBBLE_SWINGS = 6; // must stay even so the dice ends tipped, ready to settle
const SETTLE_MS = 140; // easing back to level
const ROLL_MS = TILT_MS + WOBBLE_MS * WOBBLE_SWINGS + SETTLE_MS; // 600ms
const TUMBLE_MS = 70; // how often the face flips while shaking
const WOBBLE_DEG = 9;
const PRESS_MS = 120;

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

// Tapping the dice steps through these in order and stops where you leave it.
const DICE_COLORS = [
  { name: 'white', face: '#F5F2EC', pip: '#111A2B' },
  { name: 'yellow', face: '#F2C94C', pip: '#3A2E05' },
  { name: 'red', face: '#E0544B', pip: '#FCEAE8' },
  { name: 'green', face: '#3FA96A', pip: '#EAF7EF' },
  { name: 'blue', face: '#4A7DE0', pip: '#EAF1FD' },
];

// Each face is a 3x3 grid, read left to right, top to bottom.
const PIP_GRID: Record<number, boolean[]> = {
  1: [false, false, false, false, true, false, false, false, false],
  2: [true, false, false, false, false, false, false, false, true],
  3: [true, false, false, false, true, false, false, false, true],
  4: [true, false, true, false, false, false, true, false, true],
  5: [true, false, true, false, true, false, true, false, true],
  6: [true, false, true, true, false, true, true, false, true],
};

/** A fair 1-6 roll. Repeats are possible, because that is what dice do. */
function fairRoll() {
  return Math.floor(Math.random() * 6) + 1;
}

/** A face that is never the one already showing, so the tumble always looks alive. */
function differentFace(current: number) {
  const others = [1, 2, 3, 4, 5, 6].filter((face) => face !== current);
  return others[Math.floor(Math.random() * others.length)];
}

export default function RollADice() {
  const [value, setValue] = useState(1);
  const [rolls, setRolls] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);

  const wobble = useSharedValue(0);
  const pressScale = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const tumbleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const color = DICE_COLORS[colorIndex];

  // Never leave timers running behind a screen that has gone away.
  useEffect(() => {
    return () => {
      if (tumbleTimer.current) clearInterval(tumbleTimer.current);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, []);

  const diceStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wobble.get() * WOBBLE_DEG}deg` }, { scale: pressScale.get() }],
  }));

  function land() {
    setValue(fairRoll());
    setRolls((count) => count + 1);
    setRolling(false);
  }

  function roll() {
    if (rolling) return;

    // Reduced motion: skip the shake entirely, keep the result.
    if (reducedMotion) {
      land();
      return;
    }

    setRolling(true);

    // These durations sum to ROLL_MS, so the shake and the result land together.
    wobble.set(
      withSequence(
        withTiming(-1, { duration: TILT_MS, easing: EASE_OUT }),
        withRepeat(
          withTiming(1, { duration: WOBBLE_MS, easing: EASE_IN_OUT }),
          WOBBLE_SWINGS,
          true
        ),
        withTiming(0, { duration: SETTLE_MS, easing: EASE_OUT })
      )
    );

    tumbleTimer.current = setInterval(() => {
      setValue(differentFace);
    }, TUMBLE_MS);

    settleTimer.current = setTimeout(() => {
      if (tumbleTimer.current) clearInterval(tumbleTimer.current);
      tumbleTimer.current = null;
      land();
    }, ROLL_MS);
  }

  function nextColor() {
    setColorIndex((index) => (index + 1) % DICE_COLORS.length);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Roll a Dice</Text>

        <Pressable
          onPress={nextColor}
          onPressIn={() => pressScale.set(withTiming(0.97, { duration: PRESS_MS, easing: EASE_OUT }))}
          onPressOut={() => pressScale.set(withTiming(1, { duration: PRESS_MS, easing: EASE_OUT }))}
          accessibilityRole="button"
          accessibilityLabel={`Dice colour: ${color.name}`}
          accessibilityHint="Tap to change the dice colour">
          <Animated.View style={[styles.dice, { backgroundColor: color.face }, diceStyle]}>
            {PIP_GRID[value].map((filled, i) => (
              <View key={i} style={styles.cell}>
                {filled ? <View style={[styles.pip, { backgroundColor: color.pip }]} /> : null}
              </View>
            ))}
          </Animated.View>
        </Pressable>

        <Text style={styles.count}>
          {rolls === 0
            ? 'tap the button to roll'
            : `rolled ${rolls} ${rolls === 1 ? 'time' : 'times'}`}
        </Text>

        <Pressable
          onPress={roll}
          disabled={rolling}
          accessibilityRole="button"
          accessibilityState={{ disabled: rolling, busy: rolling }}
          accessibilityLabel={`Roll the dice. Currently showing ${value}.`}
          hitSlop={12}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            rolling && styles.buttonRolling,
          ]}>
          <Text style={styles.buttonLabel}>Roll</Text>
        </Pressable>

        <Text style={styles.hint}>tap the dice to change its colour</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    padding: 24,
  },
  title: {
    color: TITLE,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dice: {
    width: 210,
    height: 210,
    borderRadius: 36,
    padding: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  cell: {
    width: '33.333%',
    height: '33.333%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pip: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  count: {
    color: MUTED,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  button: {
    backgroundColor: ACCENT,
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 999,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonRolling: {
    opacity: 0.45,
  },
  buttonLabel: {
    color: ACCENT_TEXT,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  hint: {
    color: HINT,
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
