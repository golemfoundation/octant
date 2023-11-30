import { useFormikContext } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import React, { FC } from 'react';

import { FormFields } from 'components/Earn/EarnGlmLock/types';
import EarnGlmLockBudgetBox from 'components/Earn/EarnGlmLockBudgetBox';

import styles from './EarnGlmLockBudget.module.scss';
import EarnGlmLockBudgetProps from './types';

const variants = {
  hide: {
    height: '0',
    margin: '0',
    opacity: '0',
    zIndex: '-1',
  },
  show: {
    height: '0',
    margin: '0',
    opacity: '0',
    zIndex: '-1',
  },
  visible: {
    height: 'auto',
    margin: '0 auto 1.6rem',
    opacity: 1,
    zIndex: '1',
  },
};

const EarnGlmLockBudget: FC<EarnGlmLockBudgetProps> = ({ isVisible }) => {
  const { errors } = useFormikContext<FormFields>();

  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <motion.div
          animate="visible"
          className={styles.wrapper}
          exit="hide"
          initial="show"
          transition={{ ease: 'linear' }}
          variants={variants}
        >
          <EarnGlmLockBudgetBox
            isCurrentlyLockedError={errors.valueToDeposeOrWithdraw === 'cantUnlock'}
            isWalletBalanceError={errors.valueToDeposeOrWithdraw === 'dontHaveEnough'}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EarnGlmLockBudget;
