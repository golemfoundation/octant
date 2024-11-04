import cx from 'classnames';
import React, { FC } from 'react';

import AvailableFundsGlmProps from './types';

import styles from '../LockGlmBudgetBox.module.scss';

const AvailableFundsGlm: FC<AvailableFundsGlmProps> = ({
  isLoading,
  isWalletBalanceError,
  value,
}) =>
  isLoading ? (
    <div className={styles.skeleton} />
  ) : (
    <div
      className={cx(styles.budgetValue, isWalletBalanceError && styles.isError)}
      data-test="LockGlmBudgetBox__walletBalance__value"
    >
      {value}
    </div>
  );

export default AvailableFundsGlm;
