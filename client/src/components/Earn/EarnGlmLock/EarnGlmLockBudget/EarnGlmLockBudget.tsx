import { useFormikContext } from 'formik';
import React, { FC } from 'react';

import EarnGlmLockBudgetBox from 'components/Earn/EarnGlmLock/EarnGlmLockBudgetBox';
import { FormFields } from 'components/Earn/EarnGlmLock/types';

import styles from './EarnGlmLockBudget.module.scss';
import EarnGlmLockBudgetProps from './types';

const EarnGlmLockBudget: FC<EarnGlmLockBudgetProps> = ({ isVisible }) => {
  const { errors } = useFormikContext<FormFields>();

  if (!isVisible) {
    return null;
  }

  return (
    <EarnGlmLockBudgetBox
      className={styles.root}
      isCurrentlyLockedError={errors.valueToDeposeOrWithdraw === 'cantUnlock'}
      isWalletBalanceError={errors.valueToDeposeOrWithdraw === 'dontHaveEnough'}
    />
  );
};

export default EarnGlmLockBudget;
