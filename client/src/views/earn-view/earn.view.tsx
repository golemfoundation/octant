import React, { ReactElement } from 'react';

import BoxRounded from 'components/core/box-rounded/box-rounded.component';
import DoubleValue from 'components/core/double-value/double-value.component';
import MainLayout from 'layouts/main-layout/main.layout.container';
import UserGlmStakeComponent from 'components/dedicated/user-glm-stake/user-glm-stake.component';
import getCurrentEpochStateText from 'utils/getCryptoValueWithSuffix';
import useIndividualReward from 'hooks/useIndividualReward';

import styles from './style.module.scss';

const EarnView = (): ReactElement => {
  const { data: individualReward } = useIndividualReward();

  return (
    <MainLayout>
      <UserGlmStakeComponent classNameBox={styles.box} />
      <BoxRounded
        alignment="left"
        buttonProps={{
          isDisabled: true,
          isHigh: true,
          label: 'Withdraw ETH Rewards',
          variant: 'cta',
        }}
        className={styles.box}
        isVertical
        title="Rewards Balance"
      >
        <DoubleValue
          mainValue={getCurrentEpochStateText({ suffix: 'ETH', value: individualReward })}
        />
      </BoxRounded>
    </MainLayout>
  );
};

export default EarnView;
