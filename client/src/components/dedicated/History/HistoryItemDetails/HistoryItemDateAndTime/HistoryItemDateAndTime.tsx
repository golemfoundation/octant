import React, { FC } from 'react';

import styles from './HistoryItemDateAndTime.module.scss';
import HistoryItemDateAndTimeProps from './types';
import { getHistoryItemDateAndTime } from './utils';

const HistoryItemDateAndTime: FC<HistoryItemDateAndTimeProps> = ({ timestamp }) => (
  <div className={styles.root}>{getHistoryItemDateAndTime(timestamp)}</div>
);

export default HistoryItemDateAndTime;
