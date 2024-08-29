import React, { memo, ReactNode } from 'react';

import Grid from 'components/shared/Grid';

import styles from './HomeGrid.module.scss';

import HomeGridCurrentGlmLock from '../HomeGridCurrentGlmLock';
import HomeGridPersonalAllocation from '../HomeGridPersonalAllocation';

const HomeGrid = (): ReactNode => (
  <Grid>
    <HomeGridCurrentGlmLock className={styles.gridTile} />
    <HomeGridPersonalAllocation className={styles.gridTile} />
  </Grid>
);

export default memo(HomeGrid);
