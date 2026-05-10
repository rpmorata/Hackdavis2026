import React, { useEffect, useState } from 'react';

const BAR_COUNT = 24;
const BASE_HEIGHTS = [6, 14, 22, 10, 30, 18, 12, 26, 8, 34, 16, 24, 6, 20, 28, 14, 10, 22, 18, 8, 32, 12, 20, 16];

interface Props {
  isActive: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function WaveformVisualizer({ isActive, color = '#0891B2', size = 'md' }: Props) {
  const [heights, setHeights] = useState<number[]>(BASE_HEIGHTS.map(() => 4));

  useEffect(() => {
    if (!isActive) {
      setHeights(BASE_HEIGHTS.map(() => 4));
      return;
    }

    const interval = setInterval(() => {
      setHeights(
        BASE_HEIGHTS.map((base) => {
          const variation = (Math.random() - 0.5) * 12;
          return Math.max(4, Math.min(base + variation, 40));
        })
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isActive]);

  const containerHeight = size === 'sm' ? 32 : size === 'lg' ? 56 : 44;
  const barWidth = size === 'sm' ? 2 : size === 'lg' ? 4 : 3;
  const gap = size === 'sm' ? 2 : 3;

  return (
    <div
      className="flex items-center"
      style={{ height: containerHeight, gap }}
    >
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: barWidth,
            height: isActive ? h : 4,
            backgroundColor: isActive ? color : '#CBD5E1',
            borderRadius: barWidth,
            transition: 'height 0.12s ease, background-color 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}
