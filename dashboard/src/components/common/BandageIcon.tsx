import React from 'react';

interface BandageIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const BandageIcon: React.FC<BandageIconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className,
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
  >
    <path d="M4.5 16.5c-1.5-1.5-1.5-4 0-5.5l7-7c1.5-1.5 4-1.5 5.5 0s1.5 4 0 5.5l-7 7c-1.5 1.5-4 1.5-5.5 0z" />
    <path d="m14 7 3 3" />
    <path d="m7 14 3 3" />
    <circle cx="12" cy="12" r="0.5" fill={color} />
  </svg>
);

export default BandageIcon;
