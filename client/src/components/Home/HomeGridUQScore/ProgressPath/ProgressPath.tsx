import cx from 'classnames';
import { motion } from 'framer-motion';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './ProgressPath.module.scss';
import ProgressPathProps from './types';

const ProgressPath: FC<ProgressPathProps> = ({ lastDoneStep }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridUQScore.progressPath',
  });
  const steps = [t('checkingPassportScore'), t('checkingAllowlist'), t('finished')];

  return (
    <motion.div className={styles.root} exit={{ opacity: 0 }} layout>
      {steps.map((step, idx) => {
        const isDone = lastDoneStep !== null && lastDoneStep >= idx;
        const isInProgress = (lastDoneStep === null && idx === 0) || lastDoneStep === idx - 1;

        return (
          <div
            key={step}
            className={cx(
              styles.step,
              isDone && styles.isDone,
              isInProgress && styles.isInProgress,
            )}
          >
            <motion.svg
              className={styles.stepSvg}
              fill="none"
              height="16"
              viewBox="0 0 16 16"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle className={styles.outsideCircle} cx="8" cy="8" r="7" />
              <motion.circle
                key="insideCircle"
                animate={isInProgress ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
                className={styles.insideCircle}
                cx="8"
                cy="8"
                r="4"
                transition={
                  isInProgress ? { delay: 0.2, duration: 2, ease: 'easeOut', repeat: Infinity } : {}
                }
              />
            </motion.svg>
            <span className={styles.stepLabel}>{step}</span>
          </div>
        );
      })}
    </motion.div>
  );
};

export default ProgressPath;
