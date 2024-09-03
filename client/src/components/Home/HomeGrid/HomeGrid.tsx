import React, { memo, ReactNode } from 'react';

import HomeGridCurrentGlmLock from 'components/Home/HomeGridCurrentGlmLock';
import HomeGridPersonalAllocation from 'components/Home/HomeGridPersonalAllocation';
import Grid from 'components/shared/Grid';

import styles from './HomeGrid.module.scss';

const HomeGrid = (): ReactNode => (
  <Grid>
    <HomeGridCurrentGlmLock className={styles.gridTile} />
    <HomeGridPersonalAllocation className={styles.gridTile} />
  </Grid>
);

export default memo(HomeGrid);
