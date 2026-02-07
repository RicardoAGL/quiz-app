import React from 'react';
import './ProgressRing.css';

/**
 * Reusable SVG circular progress indicator.
 * @param {{ size?: number, progress?: number, strokeWidth?: number, color?: string }} props
 */
export default function ProgressRing({
  size = 48,
  progress = 0,
  strokeWidth = 4,
  color = '#3498db',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <svg
      className="progress-ring"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      {/* Background circle */}
      <circle
        className="progress-ring__bg"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      {/* Foreground arc */}
      <circle
        className="progress-ring__fg"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ '--ring-offset': offset, '--ring-circumference': circumference }}
      />
      {/* Center text */}
      <text
        className="progress-ring__text"
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={size * 0.26}
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
}
