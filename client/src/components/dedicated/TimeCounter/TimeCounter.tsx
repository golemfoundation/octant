import { Duration } from 'date-fns';
import React, { FC, Fragment, useEffect, useState } from 'react';
import cx from 'classnames';

import Loader from 'components/core/Loader/Loader';
import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import getDurationBetweenTimestamps from 'utils/getDurationBetweenTimestamps';

import TimeCounterProps, { CounterSectionsProps } from './types';
import styles from './style.module.scss';

const CounterSection: FC<CounterSectionsProps> = ({
  value = 0,
  label,
  isDividerVisible = true,
}) => {
  return (
    <Fragment>
      <div className={styles.counterSection}>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
      </div>
      {isDividerVisible && <div className={styles.divider}>:</div>}
    </Fragment>
  );
};

const TimeCounter: FC<TimeCounterProps> = ({
  className,
  timestamp,
  duration,
  onCountingFinish,
}) => {
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
    <div className={cx(styles.root, className)}>
      <div className={styles.counters}>
        <CounterSection label="Days" value={time.days} />
        <CounterSection label="Hours" value={time.hours} />
        <CounterSection label="Minutes" value={time.minutes} />
        <CounterSection isDividerVisible={false} label="Seconds" value={time.seconds} />
      </div>
      <ProgressBar progressPercentage={progressPercentage} />
    </div>
  );
};

export default TimeCounter;
