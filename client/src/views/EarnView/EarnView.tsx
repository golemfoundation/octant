import React, { ReactElement } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';
import UserGlmStakeComponent from 'components/dedicated/UserGlmStake/UserGlmStake';
import getFormattedUnit from 'utils/getFormattedUnit';
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
        <DoubleValue mainValue={individualReward ? getFormattedUnit(individualReward) : '0.0'} />
      </BoxRounded>
    </MainLayoutContainer>
  );
};

export default EarnView;
