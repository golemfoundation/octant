import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import InputToggle from 'components/ui/InputToggle';

import styles from './HomeGridRewardsEstimatorUqSelector.module.scss';
import HomeGridRewardsEstimatorUqSelectorProps from './types';

const HomeGridRewardsEstimatorUqSelector: FC<HomeGridRewardsEstimatorUqSelectorProps> = ({
  isUqScoreOverThresholdGivingMultiplier1,
  onChange,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridRewardsEstimator',
  });

  return (
    <div className={styles.root} data-test="HomeGridRewardsEstimatorUqSelector">
      <div className={styles.label}>{t('minimalUqValueGivingMultiplier1')}</div>
      <InputToggle
        dataTest="HomeGridRewardsEstimatorUqSelector__InputToggle"
        isChecked={isUqScoreOverThresholdGivingMultiplier1}
        onChange={({ target: { checked: isChecked } }) => onChange(isChecked)}
      />
    </div>
  );
};

export default HomeGridRewardsEstimatorUqSelector;
