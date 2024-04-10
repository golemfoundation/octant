import cx from 'classnames';
import { motion } from 'framer-motion';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './EarnRewardsCalculatorDaysSelector.module.scss';
import EarnRewardsCalculatorDaysSelectorProps from './types';

const EarnRewardsCalculatorDaysSelector: FC<EarnRewardsCalculatorDaysSelectorProps> = ({
  days,
  onChange,
}) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.rewardsCalculator',
  });

  const epochDurationInDays = 90;
  const selectorOptions = [90, 180, 270];

  return (
    <div className={styles.root}>
      <div className={styles.daysSelectorLabel}>
        {t('lockForEpoch', { count: days / epochDurationInDays })}
      </div>
      <div className={styles.daysSelector}>
        <div className={styles.daysWrapper}>
          {selectorOptions.map(duration => (
            <div
              key={duration}
              className={cx(styles.day, days === duration && styles.isSelected)}
              onClick={() => onChange(duration)}
            >
              <span className={styles.dayLabel}>{duration}</span>
              {days === duration ? (
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

export default EarnRewardsCalculatorDaysSelector;
