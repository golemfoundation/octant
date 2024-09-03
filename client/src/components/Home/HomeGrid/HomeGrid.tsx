import React, { memo, ReactNode } from 'react';
import { useAccount } from 'wagmi';

import HomeGridCurrentGlmLock from 'components/Home/HomeGridCurrentGlmLock';
import HomeGridDivider from 'components/Home/HomeGridDivider';
import HomeGridDonations from 'components/Home/HomeGridDonations';
import HomeGridPersonalAllocation from 'components/Home/HomeGridPersonalAllocation';
import HomeGridRewardsEstimator from 'components/Home/HomeGridRewardsEstimator';
import HomeGridTransactions from 'components/Home/HomeGridTransactions';
import HomeGridUQScore from 'components/Home/HomeGridUQScore';
import Grid from 'components/shared/Grid';
import useMediaQuery from 'hooks/helpers/useMediaQuery';

import styles from './HomeGrid.module.scss';

const HomeGrid = (): ReactNode => {
  const { isConnected } = useAccount();
  const { isLargeDesktop, isDesktop, isTablet } = useMediaQuery();

  return (
    <Grid>
      <HomeGridCurrentGlmLock className={styles.gridTile} />
      <HomeGridPersonalAllocation className={styles.gridTile} />
      <HomeGridDonations className={styles.gridTile} />
      {isConnected && <HomeGridUQScore className={styles.gridTile} />}
      {isLargeDesktop && <HomeGridDivider />}
      <HomeGridTransactions className={styles.gridTile} />
      <HomeGridRewardsEstimator className={styles.gridTile} />
      {!isLargeDesktop && (isDesktop || isTablet) && <HomeGridDivider />}
    </Grid>
  );
};

export default memo(HomeGrid);
