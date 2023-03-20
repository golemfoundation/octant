import cx from 'classnames';
import React, { FC } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './RewardsBox.module.scss';
import RewardsBoxProps from './types';

const RewardsBox: FC<RewardsBoxProps> = ({ className }) => {
  const { data: individualReward } = useIndividualReward();

  const rewards = [
    {
      label: 'Available now',
      value: individualReward ? getFormattedEthValue(individualReward).fullString : '0.0',
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
      {rewards.map(({ label, value }, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className={styles.reward}>
          <div className={styles.label}>{label}</div>
          <DoubleValue mainValue={value} variant="small" />
        </div>
      ))}
    </BoxRounded>
  );
};

export default RewardsBox;
