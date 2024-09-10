import React, { memo, ReactNode } from 'react';

import HomeGridCurrentGlmLock from 'components/Home/HomeGridCurrentGlmLock';
import HomeGridPersonalAllocation from 'components/Home/HomeGridPersonalAllocation';
import HomeGridRewardsEstimator from 'components/Home/HomeGridRewardsEstimator';
import HomeGridUQScore from 'components/Home/HomeGridUQScore';
import Grid from 'components/shared/Grid';

import styles from './HomeGrid.module.scss';

const HomeGrid = (): ReactNode => {
  return (
    <Grid>
      <HomeGridCurrentGlmLock className={styles.gridTile} />
      <HomeGridPersonalAllocation className={styles.gridTile} />
      <HomeGridUQScore className={styles.gridTile} />
      <HomeGridRewardsEstimator className={styles.gridTile} />
    </Grid>
  );
};

export default memo(HomeGrid);
