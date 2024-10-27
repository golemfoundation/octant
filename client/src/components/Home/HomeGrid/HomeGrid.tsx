import cx from 'classnames';
import React, { memo, ReactNode } from 'react';

import HomeGridCurrentGlmLock from 'components/Home/HomeGridCurrentGlmLock';
import HomeGridDivider from 'components/Home/HomeGridDivider';
import HomeGridDonations from 'components/Home/HomeGridDonations';
import HomeGridEpochResults from 'components/Home/HomeGridEpochResults';
import HomeGridPersonalAllocation from 'components/Home/HomeGridPersonalAllocation';
import HomeGridRewardsEstimator from 'components/Home/HomeGridRewardsEstimator';
import HomeGridTransactions from 'components/Home/HomeGridTransactions';
import HomeGridUQScore from 'components/Home/HomeGridUQScore';
import HomeGridVideoBar from 'components/Home/HomeGridVideoBar';
import Grid from 'components/shared/Grid';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useSettingsStore from 'store/settings/store';

import styles from './HomeGrid.module.scss';

const HomeGrid = (): ReactNode => {
  const { isLargeDesktop, isDesktop, isMobile, isTablet } = useMediaQuery();
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();

  const { showHelpVideos } = useSettingsStore(state => ({
    showHelpVideos: state.data.showHelpVideos,
  }));

  const showDivider1 =
    showHelpVideos &&
    ((isProjectAdminMode && isDesktop && !isLargeDesktop) ||
      (!isProjectAdminMode && !isPatronMode && !isMobile) ||
      (isPatronMode && (isLargeDesktop || isTablet)));

  const showDivider2 =
    (!isPatronMode && !isMobile) ||
    (isPatronMode && showHelpVideos && !isMobile) ||
    (isPatronMode && !showHelpVideos && (isLargeDesktop || isTablet));

  return (
    <Grid>
      {!isProjectAdminMode && <HomeGridCurrentGlmLock className={styles.gridTile} />}
      {!isProjectAdminMode && !isPatronMode && <HomeGridDonations className={styles.gridTile} />}
      {!isPatronMode && <HomeGridPersonalAllocation className={styles.gridTile} />}
      {!isProjectAdminMode && <HomeGridUQScore className={styles.gridTile} />}
      {showDivider1 && <HomeGridDivider className={styles.divider1} />}
      {showHelpVideos && (
        <HomeGridVideoBar
          className={cx(
            styles.gridTile,
            styles.videoBar,
            isPatronMode && styles.isPatronMode,
            isProjectAdminMode && styles.isProjectAdminMode,
          )}
        />
      )}
      {showDivider2 && <HomeGridDivider className={styles.divider2} />}
      <HomeGridTransactions
        className={cx(
          styles.gridTile,
          styles.transactions,
          isPatronMode && styles.isPatronMode,
          isProjectAdminMode && styles.isProjectAdminMode,
        )}
      />
      <HomeGridRewardsEstimator
        className={cx(
          styles.gridTile,
          styles.rewardsEstimator,
          isPatronMode && styles.isPatronMode,
          isProjectAdminMode && styles.isProjectAdminMode,
        )}
      />
      <HomeGridEpochResults
        className={cx(
          styles.gridTile,
          styles.epochResults,
          isPatronMode && styles.isPatronMode,
          isProjectAdminMode && styles.isProjectAdminMode,
          showHelpVideos && styles.withVideoBar,
        )}
      />
    </Grid>
  );
};

export default memo(HomeGrid);
