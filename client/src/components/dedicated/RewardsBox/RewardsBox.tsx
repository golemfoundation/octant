import cx from 'classnames';
import React, { FC } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import useWithdrawableUserEth from 'hooks/queries/useWithdrawableUserEth';

import styles from './RewardsBox.module.scss';
import RewardsBoxProps from './types';

const RewardsBox: FC<RewardsBoxProps> = ({ buttonProps, className, isGrey }) => {
  const { data: withdrawableUserEth } = useWithdrawableUserEth();

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        valueCrypto: withdrawableUserEth,
      },
      label: 'Available now',
    },
  ];

  return (
    <BoxRounded
      alignment="left"
      buttonProps={buttonProps}
      className={cx(styles.root, className)}
      hasSections
      isGrey={isGrey}
      isVertical
      title="Rewards"
    >
      <Sections sections={sections} />
    </BoxRounded>
  );
};

export default RewardsBox;
