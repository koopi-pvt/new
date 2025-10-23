"use client";

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
};

export default function LoadingSpinner({ size = 'md', color = '#000000' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3'
  };

  return (
    <div
      className={`${sizes[size]} rounded-full animate-spin`}
      style={{
        borderColor: color,
        borderTopColor: 'transparent'
      }}
    />
  );
}