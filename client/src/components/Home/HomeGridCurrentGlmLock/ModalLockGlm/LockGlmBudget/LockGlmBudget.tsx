import { useFormikContext } from 'formik';
import React, { FC } from 'react';

import { FormFields } from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm/LockGlm/types';
import LockGlmBudgetBox from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm/LockGlmBudgetBox';

import styles from './LockGlmBudget.module.scss';
import LockGlmBudgetProps from './types';

const LockGlmBudget: FC<LockGlmBudgetProps> = ({ isVisible }) => {
  const { errors } = useFormikContext<FormFields>();

  if (!isVisible) {
    return null;
  }

  return (
    <LockGlmBudgetBox
      className={styles.root}
      isCurrentlyLockedError={errors.valueToDeposeOrWithdraw === 'cantUnlock'}
      isWalletBalanceError={errors.valueToDeposeOrWithdraw === 'dontHaveEnough'}
    />
  );
};

export default LockGlmBudget;
