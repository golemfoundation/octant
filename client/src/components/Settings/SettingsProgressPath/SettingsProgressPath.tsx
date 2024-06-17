import cx from 'classnames';
import { motion } from 'framer-motion';
import React, { FC, useEffect, useState } from 'react';

import styles from './SettingsProgressPath.module.scss';

const SettingsProgressPath: FC = () => {
  const steps = ['1', '2', '3', '4'];
  const [lastDoneStep, setLastDoneStep] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setLastDoneStep(prev => prev + 1);
    }, 2500);
  }, []);

  return (
    <div className={styles.root}>
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
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <motion.circle
                key="outsideCircle"
                cx="8"
                cy="8"
                r="7"
                className={styles.outsideCircle}
              />
              <motion.circle
                key="insideCircle"
                cx="8"
                cy="8"
                r="4"
                className={styles.insideCircle}
                animate={isInProgress ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
                transition={
                  isInProgress ? { duration: 2, delay: 0.2, ease: 'easeOut', repeat: Infinity } : {}
                }
              />
            </motion.svg>
            <span className={styles.stepLabel}>{step}</span>
          </div>
        );
      })}
    </div>
  );
};

export default SettingsProgressPath;
