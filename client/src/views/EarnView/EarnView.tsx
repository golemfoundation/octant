import React, { ReactElement } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';
import UserGlmStakeComponent from 'components/dedicated/UserGlmStake/UserGlmStake';
import getCurrentEpochStateText from 'utils/getCryptoValueWithSuffix';
import useIndividualReward from 'hooks/useIndividualReward';

import styles from './style.module.scss';

const EarnView = (): ReactElement => {
  const { data: individualReward } = useIndividualReward();

  return (
    <MainLayoutContainer>
      <UserGlmStakeComponent classNameBox={styles.box} />
      <BoxRounded
        alignment="left"
        buttonProps={{
          isDisabled: true,
          isHigh: true,
          label: 'Withdraw ETH Rewards',
          variant: 'secondary',
        }}
        className={styles.box}
        isVertical
        title="Rewards Balance"
      >
        <DoubleValue
          mainValue={getCurrentEpochStateText({ suffix: 'ETH', value: individualReward })}
        />
      </BoxRounded>
    </MainLayoutContainer>
  );
};

export default EarnView;
