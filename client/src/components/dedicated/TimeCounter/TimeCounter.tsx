import cx from 'classnames';
import { Duration } from 'date-fns';
import React, { FC, Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Loader from 'components/core/Loader/Loader';
import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import getDurationBetweenTimestamps from 'utils/getDurationBetweenTimestamps';

import styles from './TimeCounter.module.scss';
import TimeCounterProps, { CounterSectionsProps } from './types';

const CounterSection: FC<CounterSectionsProps> = ({
  value = 0,
  label,
  isDividerVisible = true,
  variant,
}) => (
  <Fragment>
    <div className={styles.counterSection}>
      <div className={cx(styles.value, styles[`variant--${variant}`])}>{value}</div>
      <div className={cx(styles.label, styles[`variant--${variant}`])}>{label}</div>
    </div>
    {isDividerVisible && <div className={cx(styles.divider, styles[`variant--${variant}`])}>:</div>}
  </Fragment>
);

const TimeCounter: FC<TimeCounterProps> = ({
  className,
  timestamp,
  duration,
  onCountingFinish,
  variant = 'standard',
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.timeCounter',
  });
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
      if (shouldDoRefetch && onCountingFinish) {
        onCountingFinish();
      }

      setTime(getDurationBetweenTimestamps(timestamp));
    };

    const timer = setTimeout(countdown, 1000);

    return () => clearTimeout(timer);
  }, [shouldDoRefetch, timestamp, time, onCountingFinish]);

  const shouldShowLoader = !timestamp || !duration || !time || shouldDoRefetch || isLoading;
  // Progress should increase the closer we are to the timestamp.
  const progressPercentage =
    timestamp && duration ? 100 - ((timestamp - Date.now()) / duration) * 100 : 0;

  return (
    <div className={cx(styles.root, styles[`variant--${variant}`], className)}>
      {shouldShowLoader &&
        (variant === 'metrics' ? (
          <div className={styles.metricsSkeleton}>
            <div className={styles.timerSkeleton} />
            <div className={styles.progressBarSkeleton} />
          </div>
        ) : (
          <Loader />
        ))}
      {!shouldShowLoader && (
        <Fragment>
          <div className={cx(styles.counters, styles[`variant--${variant}`])}>
            <CounterSection label={i18n.t('common.days')} value={time.days} variant={variant} />
            <CounterSection label={t('hours')} value={time.hours} variant={variant} />
            <CounterSection label={t('minutes')} value={time.minutes} variant={variant} />
            <CounterSection
              isDividerVisible={false}
              label={t('seconds')}
              value={time.seconds}
              variant={variant}
            />
          </div>
          {['standard', 'metrics'].includes(variant) && (
            <ProgressBar
              progressPercentage={progressPercentage}
              variant={variant === 'metrics' ? 'thin' : 'normal'}
            />
          )}
        </Fragment>
      )}
    </div>
  );
};

export default TimeCounter;
