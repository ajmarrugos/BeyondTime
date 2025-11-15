import React, { memo } from 'react';

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
  const style: React.CSSProperties = {
    top: initialTop,
    left: initialLeft,
    animationName: animationName,
    animationDuration: animationDuration,
    animationDelay: animationDelay,
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