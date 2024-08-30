import cx from 'classnames';
import { motion } from 'framer-motion';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './HomeGridRewardsEstimatorEpochDaysSelector.module.scss';
import HomeGridRewardsEstimatorEpochDaysSelectorProps from './types';

const HomeGridRewardsEstimatorEpochDaysSelector: FC<
  HomeGridRewardsEstimatorEpochDaysSelectorProps
> = ({ numberOfEpochs, onChange }) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridRewardsEstimator',
  });

  const epochDurationInDays = 90;
  const selectorOptions = [1, 2, 3]; // Epochs

  const dataTest = 'HomeGridRewardsEstimatorEpochDaysSelector';

  return (
    <div className={styles.root} data-test={dataTest}>
      <div className={styles.daysSelectorLabel} data-test={`${dataTest}__label`}>
        {t('lockForEpoch', { count: numberOfEpochs })}
      </div>
      <div className={styles.daysSelector}>
        <div className={styles.daysWrapper}>
          {selectorOptions.map(epoch => (
            <div
              key={epoch}
              className={cx(styles.day, numberOfEpochs === epoch && styles.isSelected)}
              data-test={`${dataTest}__option--${epoch}`}
              onClick={() => onChange(epoch)}
            >
              <span className={styles.dayLabel} data-test={`${dataTest}__optionLabel--${epoch}`}>
                {epoch * epochDurationInDays}
              </span>
              {numberOfEpochs === epoch ? (
                <motion.div
                  className={styles.selectedItemBackground}
                  data-test={`${dataTest}__optionBackground--${epoch}`}
                  layoutId="background"
                  transition={{ duration: 0.1 }}
                />
              ) : null}
            </div>
          ))}
        </div>
        <div className={styles.suffix} data-test={`${dataTest}__suffix`}>
          {i18n.t('common.days')}
        </div>
      </div>
    </div>
  );
};

export default HomeGridRewardsEstimatorEpochDaysSelector;
