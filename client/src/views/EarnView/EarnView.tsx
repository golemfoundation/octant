import React, { ReactElement } from 'react';

import BoxGlmLock from 'components/dedicated/BoxGlmLock/BoxGlmLock';
import BoxWithdrawEth from 'components/dedicated/BoxWithdrawEth/BoxWithdrawEth';
import History from 'components/dedicated/History/History';
import MainLayout from 'layouts/MainLayout/MainLayout';

import styles from './EarnView.module.scss';

const EarnView = (): ReactElement => (
  <MainLayout classNameBody={styles.layoutBody} dataTest="EarnView">
    <div className={styles.boxesWrapper}>
      <BoxGlmLock classNameBox={styles.box} />
      <BoxWithdrawEth classNameBox={styles.box} />
    </div>
    <History />
  </MainLayout>
);

export default EarnView;
