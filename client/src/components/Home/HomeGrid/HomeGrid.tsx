import React, { memo, ReactNode } from 'react';
import Grid from 'components/shared/Grid';
import HomeGridCurrentGlmLock from '../HomeGridCurrentGlmLock';

import styles from './HomeGrid.module.scss';

const HomeGrid = (): ReactNode => (
  <Grid>
    <HomeGridCurrentGlmLock className={styles.gridTile} />
  </Grid>
);

export default memo(HomeGrid);
