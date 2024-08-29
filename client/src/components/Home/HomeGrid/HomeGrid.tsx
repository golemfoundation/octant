import React, { memo, ReactNode } from 'react';
import { useAccount } from 'wagmi';

import Grid from 'components/shared/Grid';

import styles from './HomeGrid.module.scss';

import HomeGridCurrentGlmLock from '../HomeGridCurrentGlmLock';
import HomeGridPersonalAllocation from '../HomeGridPersonalAllocation';
import HomeGridUQScore from '../HomeGridUQScore';

const HomeGrid = (): ReactNode => {
  const { isConnected } = useAccount();

  return (
    <Grid>
      <HomeGridCurrentGlmLock className={styles.gridTile} />
      <HomeGridPersonalAllocation className={styles.gridTile} />
      {isConnected && <HomeGridUQScore className={styles.gridTile} />}
    </Grid>
  );
};

export default memo(HomeGrid);
