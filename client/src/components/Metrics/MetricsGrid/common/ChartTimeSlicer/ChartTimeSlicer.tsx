import cx from 'classnames';
import { startOfDay, sub } from 'date-fns';
import React, { FC, useEffect, useState } from 'react';

import styles from './ChartTimeSlicer.module.scss';
import ChartTimeSlicerProps from './types';

const ChartTimeSlicer: FC<ChartTimeSlicerProps> = ({ onValueChange }) => {
  const [value, setValue] = useState('3M');

  const values = ['3M', '6M', '1Y', 'ALL'];

  useEffect(() => {
    const startOfDayNow = startOfDay(new Date());
    let dateToFilter: Date | null = null;

    switch (value) {
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
  }, [value, onValueChange]);

  return (
    <div className={styles.root}>
      {values.map(val => (
        <div
          key={val}
          className={cx(styles.item, value === val && styles.active)}
          onClick={() => setValue(val)}
        >
          {val}
        </div>
      ))}
    </div>
  );
};

export default ChartTimeSlicer;
