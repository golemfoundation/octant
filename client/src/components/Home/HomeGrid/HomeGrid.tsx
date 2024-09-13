import React, { memo, ReactNode } from 'react';

import HomeGridCurrentGlmLock from 'components/Home/HomeGridCurrentGlmLock';
import HomeGridDivider from 'components/Home/HomeGridDivider';
import HomeGridDonations from 'components/Home/HomeGridDonations';
import HomeGridEpochResults from 'components/Home/HomeGridEpochResults';
import HomeGridPersonalAllocation from 'components/Home/HomeGridPersonalAllocation';
import HomeGridRewardsEstimator from 'components/Home/HomeGridRewardsEstimator';
import HomeGridTransactions from 'components/Home/HomeGridTransactions';
import HomeGridUQScore from 'components/Home/HomeGridUQScore';
import Grid from 'components/shared/Grid';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';

import styles from './HomeGrid.module.scss';

const HomeGrid = (): ReactNode => {
  const { isLargeDesktop, isDesktop, isTablet } = useMediaQuery();
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();

  return (
    <Grid>
      <HomeGridCurrentGlmLock className={styles.gridTile} />
      {!isProjectAdminMode && !isPatronMode && (
        <HomeGridPersonalAllocation className={styles.gridTile} />
      )}
      {!isProjectAdminMode && !isPatronMode && <HomeGridDonations className={styles.gridTile} />}
      {!isProjectAdminMode && <HomeGridUQScore className={styles.gridTile} />}
      {!isProjectAdminMode && !isPatronMode && isLargeDesktop && <HomeGridDivider />}
      <HomeGridTransactions className={styles.gridTile} />
      <HomeGridRewardsEstimator className={styles.gridTile} />
      {((!isLargeDesktop && (isDesktop || isTablet)) ||
        (isLargeDesktop && (isProjectAdminMode || isPatronMode))) && <HomeGridDivider />}
      <HomeGridEpochResults className={styles.gridTile} />
    </Grid>
  );
};

export default memo(HomeGrid);
