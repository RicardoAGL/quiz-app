import React from 'react';
import './AccuracyBadge.css';

/**
 * Color-coded accuracy pill badge.
 * Red (<50%), amber (50-74%), blue (75-89%), green (90%+).
 * @param {{ accuracy: number|string }} props
 */
export default function AccuracyBadge({ accuracy }) {
  const value = typeof accuracy === 'string' ? parseFloat(accuracy) : accuracy;
  const isZero = value === 0 || isNaN(value);

  let tier;
  if (isZero) {
    tier = 'none';
  } else if (value < 50) {
    tier = 'red';
  } else if (value < 75) {
    tier = 'amber';
  } else if (value < 90) {
    tier = 'blue';
  } else {
    tier = 'green';
  }

  return (
    <span className={`accuracy-badge accuracy-badge--${tier}`}>
      {isZero ? '–' : `${value.toFixed(1)}%`}
    </span>
  );
}
