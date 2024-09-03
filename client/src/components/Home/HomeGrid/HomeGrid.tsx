import React, { memo, ReactNode } from 'react';

import HomeGridCurrentGlmLock from 'components/Home/HomeGridCurrentGlmLock';
import Grid from 'components/shared/Grid';

import styles from './HomeGrid.module.scss';

const HomeGrid = (): ReactNode => (
  <Grid>
    <HomeGridCurrentGlmLock className={styles.gridTile} />
  </Grid>
);

export default memo(HomeGrid);
