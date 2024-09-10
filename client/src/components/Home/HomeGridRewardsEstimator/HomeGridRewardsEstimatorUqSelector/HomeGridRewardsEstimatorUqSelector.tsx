import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import InputToggle from 'components/ui/InputToggle';

import styles from './HomeGridRewardsEstimatorUqSelector.module.scss';
import HomeGridRewardsEstimatorUqSelectorProps from './types';

const HomeGridRewardsEstimatorUqSelector: FC<HomeGridRewardsEstimatorUqSelectorProps> = ({
  isUqScoreOver20,
  onChange,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridRewardsEstimator',
  });

  const dataTest = 'HomeGridRewardsEstimatorUqSelector';

  return (
    <div className={styles.root} data-test={dataTest}>
      <div className={styles.label}>{t('uq20+')}</div>
      <InputToggle
        isChecked={isUqScoreOver20}
        onChange={({ target: { checked: isChecked } }) => onChange(isChecked)}
      />
    </div>
  );
};

export default HomeGridRewardsEstimatorUqSelector;
