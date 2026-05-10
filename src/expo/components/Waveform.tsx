import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

export function Waveform({ active }: { active: boolean }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setTick((value) => value + 1), 160);
    return () => clearInterval(timer);
  }, [active]);

  return (
    <View style={styles.wrap}>
      {Array.from({ length: 22 }).map((_, index) => {
        const height = active ? 18 + Math.abs(Math.sin((tick + index) * 0.72)) * 58 : 14;
        return <View key={index} style={[styles.bar, { height }]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    height: 92,
    justifyContent: 'center',
  },
  bar: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    opacity: 0.85,
    width: 5,
  },
});
