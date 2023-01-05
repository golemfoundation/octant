import { Duration } from 'date-fns';
import React, { FC, Fragment, useEffect, useState } from 'react';

import Loader from 'components/core/Loader/Loader';
import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import getDurationBetweenTimestamps from 'utils/getDurationBetweenTimestamps';

import CounterProps, { CounterSectionsProps } from './types';
import styles from './style.module.scss';

const CounterSection: FC<CounterSectionsProps> = ({ value, label, isNextEmpty = true }) => {
  if (value === undefined || value <= 0) {
    return null;
  }
  return (
    <Fragment>
      <div className={styles.counterSection}>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
      </div>
      {!isNextEmpty && <div className={styles.divider}>:</div>}
    </Fragment>
  );
};

const isNextEmpty = (next?: number): boolean => !next || next === 0;

const TimeCounter: FC<CounterProps> = ({ timestamp, duration, onCountingFinish }) => {
  const [time, setTime] = useState<Duration | undefined>(undefined);
  const shouldDoRefetch = timestamp ? timestamp < Date.now() : false;

  useEffect(() => {
    if (!timestamp) {
      return;
    }

    setTime(getDurationBetweenTimestamps(timestamp));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timestamp]);

  useEffect(() => {
    if (!timestamp) {
      return;
    }

    const countdown = () => {
      if (shouldDoRefetch) {
        onCountingFinish();
      }

      setTime(getDurationBetweenTimestamps(timestamp));
    };

    const timer = setTimeout(countdown, 1000);

    return () => clearTimeout(timer);
  }, [shouldDoRefetch, timestamp, time, onCountingFinish]);

  if (!timestamp || !duration || !time || shouldDoRefetch) {
    return <Loader />;
  }

  const progressPercentage = ((timestamp - Date.now()) / duration) * 100;

  return (
    <div className={styles.root}>
      <div className={styles.counters}>
        <CounterSection isNextEmpty={isNextEmpty(time.months)} label="Years" value={time.years} />
        <CounterSection isNextEmpty={isNextEmpty(time.days)} label="Months" value={time.months} />
        <CounterSection isNextEmpty={isNextEmpty(time.hours)} label="Days" value={time.days} />
        <CounterSection isNextEmpty={isNextEmpty(time.minutes)} label="Hours" value={time.hours} />
        <CounterSection
          isNextEmpty={isNextEmpty(time.seconds)}
          label="Minutes"
          value={time.minutes}
        />
        <CounterSection label="Seconds" value={time.seconds} />
      </div>
      <ProgressBar progressPercentage={progressPercentage} />
    </div>
  );
};

export default TimeCounter;
