import React, { ReactElement } from 'react';

import BoxGlmLock from 'components/dedicated/BoxGlmLock/BoxGlmLock';
import BoxWithdrawEth from 'components/dedicated/BoxWithdrawEth/BoxWithdrawEth';
import HistoryContainer from 'components/dedicated/History/HistoryContainer';
import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';

import styles from './EarnView.module.scss';

const EarnView = (): ReactElement => (
  <MainLayoutContainer>
    <BoxGlmLock classNameBox={styles.box} />
    <BoxWithdrawEth classNameBox={styles.box} />
    <HistoryContainer />
  </MainLayoutContainer>
);

export default EarnView;
