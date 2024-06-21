import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/ui/BoxRounded/Sections/types';
import useWithdrawals from 'hooks/queries/useWithdrawals';

import styles from './LayoutWalletPersonalAllocation.module.scss';
import LayoutWalletPersonalAllocationProps from './types';

const LayoutWalletPersonalAllocation: FC<LayoutWalletPersonalAllocationProps> = ({
  buttonProps,
  className,
  isGrey,
  isDisabled,
}) => {
  const { i18n } = useTranslation('translation');
  const { data: withdrawals, isFetching: isFetchingWithdrawals } = useWithdrawals();

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: isFetchingWithdrawals,
        showCryptoSuffix: true,
        valueCrypto: withdrawals?.sums.available,
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
      title={i18n.t('common.personalAllocation')}
    >
      <Sections sections={sections} />
    </BoxRounded>
  );
};

export default LayoutWalletPersonalAllocation;
