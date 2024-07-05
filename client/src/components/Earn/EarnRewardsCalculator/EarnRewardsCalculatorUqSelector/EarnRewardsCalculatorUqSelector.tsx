import cx from 'classnames';
import { motion } from 'framer-motion';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './EarnRewardsCalculatorUqSelector.module.scss';
import EarnRewardsCalculatorUqSelectorProps from './types';

const EarnRewardsCalculatorUqSelector: FC<EarnRewardsCalculatorUqSelectorProps> = ({
  isUqScoreOver20,
  onChange,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.rewardsCalculator.uqSelector',
  });

  const selectorOptions = [true, false]; // isUqScoreOver20

  const dataTest = 'EarnRewardsCalculatorUqSelector';

  return (
    <div className={styles.root} data-test={dataTest}>
      <div className={styles.daysSelectorLabel} data-test={`${dataTest}__label`}>
        {t('header')}
      </div>
      <div className={styles.daysSelector}>
        <div className={styles.daysWrapper}>
          {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
          {selectorOptions.map(option => (
            <div
              key={`${option}`}
              className={cx(styles.day, isUqScoreOver20 === option && styles.isSelected)}
              data-test={`${dataTest}__option--${option}`}
              onClick={() => onChange(option)}
            >
              <span className={styles.dayLabel} data-test={`${dataTest}__optionLabel--${option}`}>
                {option ? t('isUqScoreOver20_true') : t('isUqScoreOver20_false')}
              </span>
              {isUqScoreOver20 === option ? (
                <motion.div
                  className={styles.selectedItemBackground}
                  data-test={`${dataTest}__optionBackground--${option}`}
                  layoutId="background_2"
                  transition={{ duration: 0.1 }}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarnRewardsCalculatorUqSelector;
