import cx from 'classnames';
import { startOfDay, sub } from 'date-fns';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './MetricsGridTileTimeSlicer.module.scss';
import MetricsGridTileTimeSlicerProps from './types';

const MetricsGridTileTimeSlicer: FC<MetricsGridTileTimeSlicerProps> = ({ onValueChange }) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'views.metrics.gridTileTimeSlicer',
  });

  const [currentValue, setCurrentValue] = useState('3M');

  const options = [
    {
      label: t('3M'),
      value: '3M',
    },
    {
      label: t('6M'),
      value: '6M',
    },
    {
      label: t('1Y'),
      value: '1Y',
    },
    {
      label: t('all'),
      value: 'ALL',
    },
  ];

  useEffect(() => {
    const startOfDayNow = startOfDay(new Date());
    let dateToFilter: Date | null = null;

    switch (currentValue) {
      case '3M':
        dateToFilter = sub(startOfDayNow, { months: 3 });
        break;
      case '6M':
        dateToFilter = sub(startOfDayNow, { months: 6 });
        break;
      case '1Y':
        dateToFilter = sub(startOfDayNow, { years: 1 });
        break;
      default:
        dateToFilter = null;
        break;
    }

    onValueChange(dateToFilter);
  }, [currentValue, onValueChange, i18n]);

  return (
    <div className={styles.root}>
      {options.map(({ value, label }) => (
        <div
          key={value}
          className={cx(styles.item, currentValue === value && styles.active)}
          onClick={() => setCurrentValue(value)}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

export default MetricsGridTileTimeSlicer;
