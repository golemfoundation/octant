import React, { ReactElement } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import History from 'components/dedicated/History/History';
import UserGlmLock from 'components/dedicated/UserGlmLock/UserGlmLock';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';
import getFormattedUnit from 'utils/getFormattedUnit';

import styles from './EarnView.module.scss';

const EarnView = (): ReactElement => {
  const { data: individualReward } = useIndividualReward();

  return (
    <MainLayoutContainer>
      <UserGlmLock classNameBox={styles.box} />
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
      <History />
    </MainLayoutContainer>
  );
};

export default EarnView;
