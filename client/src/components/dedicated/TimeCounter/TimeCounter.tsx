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
  labelSmall,
  isDividerVisible = true,
  variant,
}) => {
  const labelFinal = variant === 'small' && labelSmall ? labelSmall : label;
  return (
    <Fragment>
      <div className={styles.counterSection}>
        <div className={cx(styles.value, styles[`variant--${variant}`])}>{value}</div>
        <div className={cx(styles.label, styles[`variant--${variant}`])}>{labelFinal}</div>
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
  variant = 'standard',
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

  const shouldShowLoader = !timestamp || !duration || !time || shouldDoRefetch;
  // Progress should increase the closer we are to the timestamp.
  const progressPercentage =
    timestamp && duration ? 100 - ((timestamp - Date.now()) / duration) * 100 : 0;

  return (
    <div className={cx(styles.root, className)}>
      {shouldShowLoader ? (
        <Loader />
      ) : (
        <Fragment>
          <div className={cx(styles.counters, styles[`variant--${variant}`])}>
            <CounterSection label={i18n.t('common.days')} value={time.days} variant={variant} />
            <CounterSection
              label={t('hours')}
              labelSmall={t('hrs')}
              value={time.hours}
              variant={variant}
            />
            <CounterSection
              label={t('minutes')}
              labelSmall={t('min')}
              value={time.minutes}
              variant={variant}
            />
            <CounterSection
              isDividerVisible={false}
              label={t('seconds')}
              labelSmall={t('sec')}
              value={time.seconds}
              variant={variant}
            />
          </div>
          {variant === 'standard' && <ProgressBar progressPercentage={progressPercentage} />}
        </Fragment>
      )}
    </div>
  );
};

export default TimeCounter;
