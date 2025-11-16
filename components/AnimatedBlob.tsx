
import React, { memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// --- Helper Component: AnimatedBlob ---

interface AnimatedBlobProps {
  color: string;
  size: string;
  initialTop: string;
  initialLeft: string;
  animationName: string;
  animationDuration: string;
  animationDelay: string;
}

const AnimatedBlob: React.FC<AnimatedBlobProps> = ({
  color,
  size,
  initialTop,
  initialLeft,
  animationName,
  animationDuration,
  animationDelay,
}) => {
  const { animationSpeed } = useTheme();

  const parseTime = (timeStr: string) => parseFloat(timeStr.replace('s', ''));

  const baseDuration = parseTime(animationDuration);
  const baseDelay = parseTime(animationDelay);

  // A speed of 1 is normal. Speed of 2 is twice as fast (half duration). Speed of 0.5 is half as fast (double duration).
  const dynamicDuration = `${(baseDuration / animationSpeed).toFixed(2)}s`;
  const dynamicDelay = `${(baseDelay / animationSpeed).toFixed(2)}s`;

  const style: React.CSSProperties = {
    top: initialTop,
    left: initialLeft,
    animationName: animationName,
    animationDuration: dynamicDuration,
    animationDelay: dynamicDelay,
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  };

  return (
    <div
      style={style}
      className={`absolute ${size} rounded-full ${color} mix-blend-soft-light filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2`}
    />
  );
};

export default memo(AnimatedBlob);
