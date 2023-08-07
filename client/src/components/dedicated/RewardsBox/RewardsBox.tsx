import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import useWithdrawableUserEth from 'hooks/queries/useWithdrawableUserEth';

import styles from './RewardsBox.module.scss';
import RewardsBoxProps from './types';

const RewardsBox: FC<RewardsBoxProps> = ({ buttonProps, className, isGrey, isDisabled }) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.rewardsBox',
  });
  const { data: withdrawableUserEth, isFetching: isFetchingWithdrawableUserEth } =
    useWithdrawableUserEth();

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: isFetchingWithdrawableUserEth,
        valueCrypto: withdrawableUserEth,
      },
      label: i18n.t('common.availableNow'),
    },
  ];

  return (
    <BoxRounded
      alignment="left"
      buttonProps={buttonProps}
      className={cx(styles.root, className, isDisabled && styles.isDisabled)}
      dataTest="RewardsBox__BoxRounded"
      hasSections
      isGrey={isGrey}
      isVertical
      title={t('rewards')}
    >
      <Sections sections={sections} />
    </BoxRounded>
  );
};

export default RewardsBox;
