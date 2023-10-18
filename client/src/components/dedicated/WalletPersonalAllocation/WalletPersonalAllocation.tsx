import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import useWithdrawableRewards from 'hooks/queries/useWithdrawableRewards';

import WalletPersonalAllocationProps from './types';
import styles from './WalletPersonalAllocation.module.scss';

const WalletPersonalAllocation: FC<WalletPersonalAllocationProps> = ({
  buttonProps,
  className,
  isGrey,
  isDisabled,
}) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.walletPersonalAllocation',
  });
  const { data: withdrawableRewards, isFetching: isWithdrawableRewardsFetching } =
    useWithdrawableRewards();

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: isWithdrawableRewardsFetching,
        valueCrypto: withdrawableRewards?.sum,
      },
      label: i18n.t('common.availableNow'),
    },
  ];

  return (
    <BoxRounded
      alignment="left"
      buttonProps={buttonProps}
      className={cx(styles.root, className, isDisabled && styles.isDisabled)}
      dataTest="WalletPersonalAllocation__BoxRounded"
      hasSections
      isGrey={isGrey}
      isVertical
      title={t('label')}
    >
      <Sections sections={sections} />
    </BoxRounded>
  );
};

export default WalletPersonalAllocation;
