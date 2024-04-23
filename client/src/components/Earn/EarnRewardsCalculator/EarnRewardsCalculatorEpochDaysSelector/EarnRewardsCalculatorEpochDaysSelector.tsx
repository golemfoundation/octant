import cx from 'classnames';
import { motion } from 'framer-motion';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './EarnRewardsCalculatorEpochDaysSelector.module.scss';
import EarnRewardsCalculatorEpochDaysSelectorProps from './types';

const EarnRewardsCalculatorEpochDaysSelector: FC<EarnRewardsCalculatorEpochDaysSelectorProps> = ({
  numberOfEpochs,
  onChange,
}) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.rewardsCalculator',
  });

  const epochDurationInDays = 90;
  const selectorOptions = [1, 2, 3]; // Epochs

  return (
    <div className={styles.root}>
      <div className={styles.daysSelectorLabel}>{t('lockForEpoch', { count: numberOfEpochs })}</div>
      <div className={styles.daysSelector}>
        <div className={styles.daysWrapper}>
          {selectorOptions.map(epoch => (
            <div
              key={epoch}
              className={cx(styles.day, numberOfEpochs === epoch && styles.isSelected)}
              onClick={() => onChange(epoch)}
            >
              <span className={styles.dayLabel}>{epoch * epochDurationInDays}</span>
              {numberOfEpochs === epoch ? (
                <motion.div
                  className={styles.selectedItemBackground}
                  layoutId="background"
                  transition={{ duration: 0.1 }}
                />
              ) : null}
            </div>
          ))}
        </div>
        <div className={styles.label}>{i18n.t('common.days')}</div>
      </div>
    </div>
  );
};

export default EarnRewardsCalculatorEpochDaysSelector;
