import React, { FC } from 'react';

import TimeCounterProps from './types';

const getSection = (value: number, label: string, isLast = false) => {
  if (value <= 0) {
    return undefined;
  }
  return `${value} ${label}${!isLast ? ', ' : ''}`;
};

const TimeCounter: FC<TimeCounterProps> = ({ duration, label }) => (
  <div>
    {label}:{' '}
    {duration ? (
      <div>
        {getSection(duration.years!, 'years')}
        {getSection(duration.months!, 'months')}
        {getSection(duration.days!, 'days')}
        {getSection(duration.hours!, 'hours')}
        {getSection(duration.minutes!, 'minutes')}
        {getSection(duration.seconds!, 'seconds', true)}.
      </div>
    ) : (
      <span>Loading...</span>
    )}
  </div>
);

export default TimeCounter;
