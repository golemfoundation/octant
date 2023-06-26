import cx from 'classnames';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './AllocationInputsRewardsAvailable.module.scss';
import AllocationInputsRewardsAvailableProps from './types';

const AllocationInputsRewardsAvailable: FC<AllocationInputsRewardsAvailableProps> = ({
  className,
  inputFocused,
  isThereSomethingToDistribute,
  isValueExceeded,
  restToDistribute,
  valueCryptoTotal,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationInputsRewardsAvailable',
  });

  const label = useMemo(() => {
    if (!isThereSomethingToDistribute) {
      return t('resetAllocations');
    }
    if (isValueExceeded) {
      return t('valueExceeded');
    }
    return t('rewardsAvailable');
  }, [t, isThereSomethingToDistribute, isValueExceeded]);

  const value = useMemo(() => {
    switch (inputFocused) {
      case 'percent':
        return `${restToDistribute.mul(100).div(valueCryptoTotal).toString()} %`;
      case 'crypto':
      default:
        return getFormattedEthValue(restToDistribute).fullString;
    }
  }, [inputFocused, restToDistribute, valueCryptoTotal]);

  return (
    <div
      className={cx(
        styles.root,
        isThereSomethingToDistribute && styles.isThereSomethingToDistribute,
        className,
      )}
    >
      {label}
      {isThereSomethingToDistribute && (
        <div className={cx(styles.value, isValueExceeded && styles.isValueExceeded)}>{value}</div>
      )}
    </div>
  );
};

export default AllocationInputsRewardsAvailable;
