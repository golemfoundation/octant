import React, { FC } from 'react';

import styles from './TransactionDetailsDateAndTime.module.scss';
import TransactionDetailsDateAndTimeProps from './types';
import { getHistoryItemDateAndTime } from './utils';

const TransactionDetailsDateAndTime: FC<TransactionDetailsDateAndTimeProps> = ({ timestamp }) => (
  <div className={styles.root}>{getHistoryItemDateAndTime(timestamp)}</div>
);

export default TransactionDetailsDateAndTime;
