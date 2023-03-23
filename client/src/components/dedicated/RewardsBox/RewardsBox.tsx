import cx from 'classnames';
import React, { FC } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import DoubleValueContainer from 'components/core/DoubleValue/DoubleValueContainer';
import useIndividualReward from 'hooks/queries/useIndividualReward';

import styles from './RewardsBox.module.scss';
import RewardsBoxProps from './types';

const RewardsBox: FC<RewardsBoxProps> = ({ className }) => {
  const { data: individualReward } = useIndividualReward();

  const rewards = [
    {
      cryptoCurrency: 'ethereum',
      label: 'Available now',
      valueCrypto: individualReward,
    },
  ];

  return (
    <BoxRounded
      alignment="left"
      className={cx(styles.root, className)}
      hasSections
      isGrey
      isVertical
      title="Rewards Budget"
    >
      {rewards.map(({ label, valueCrypto, cryptoCurrency }, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className={styles.reward}>
          <div className={styles.label}>{label}</div>
          <DoubleValueContainer
            cryptoCurrency={cryptoCurrency as 'golem' | 'ethereum'}
            valueCrypto={valueCrypto}
            variant="small"
          />
        </div>
      ))}
    </BoxRounded>
  );
};

export default RewardsBox;
