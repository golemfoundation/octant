import React, { ReactElement } from 'react';

import History from 'components/dedicated/History/History';
import UserEthWithdraw from 'components/dedicated/UserEthWithdraw/UserEthWithdraw';
import UserGlmLock from 'components/dedicated/UserGlmLock/UserGlmLock';
import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';

import styles from './EarnView.module.scss';

const EarnView = (): ReactElement => {
  return (
    <MainLayoutContainer>
      <UserGlmLock classNameBox={styles.box} />
      <UserEthWithdraw classNameBox={styles.box} />
      <History />
    </MainLayoutContainer>
  );
};

export default EarnView;
