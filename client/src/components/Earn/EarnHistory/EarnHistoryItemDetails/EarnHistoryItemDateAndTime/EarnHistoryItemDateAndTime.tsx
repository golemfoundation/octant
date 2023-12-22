import React, { FC } from 'react';

import styles from './EarnHistoryItemDateAndTime.module.scss';
import EarnHistoryItemDateAndTimeProps from './types';
import { getHistoryItemDateAndTime } from './utils';

const EarnHistoryItemDateAndTime: FC<EarnHistoryItemDateAndTimeProps> = ({ timestamp }) => (
  <div className={styles.root}>{getHistoryItemDateAndTime(timestamp)}</div>
);

export default EarnHistoryItemDateAndTime;
