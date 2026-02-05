import cx from 'classnames';
import React, { memo, ReactElement } from 'react';

import HomeGridAllocate from 'components/Home/HomeGridAllocate';
import HomeGridCurrentGlmLock from 'components/Home/HomeGridCurrentGlmLock';
import HomeGridCurrentGlmLockMigration from 'components/Home/HomeGridCurrentGlmLock/HomeGridCurrentGlmLockMigration';
import HomeGridDivider from 'components/Home/HomeGridDivider';
import HomeGridDonations from 'components/Home/HomeGridDonations';
import HomeGridEpochResults from 'components/Home/HomeGridEpochResults';
import HomeGridMigrate from 'components/Home/HomeGridMigrate';
import HomeGridPersonalAllocation from 'components/Home/HomeGridPersonalAllocation';
import HomeGridPersonalAllocationMigration from 'components/Home/HomeGridPersonalAllocation/HomeGridPersonalAllocationMigration';
import HomeGridRewardsEstimator from 'components/Home/HomeGridRewardsEstimator';
import HomeGridTransactions from 'components/Home/HomeGridTransactions';
import HomeGridUQScore from 'components/Home/HomeGridUQScore';
import HomeGridVideoBar from 'components/Home/HomeGridVideoBar';
import Grid from 'components/shared/Grid';
import useIsMigrationMode from 'hooks/helpers/useIsMigrationMode';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useSettingsStore from 'store/settings/store';

import styles from './HomeGrid.module.scss';

const HomeGrid = (): ReactElement => {
  const { isLargeDesktop, isDesktop, isMobile, isTablet } = useMediaQuery();
  const isProjectAdminMode = useIsProjectAdminMode();
  const isInMigrationMode = useIsMigrationMode();
  const { data: isPatronMode } = useIsPatronMode();
  const dataTestRoot = 'HomeGrid';

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
    <Grid dataTest={dataTestRoot} isFourInARowEnabled={!isInMigrationMode}>
      {isInMigrationMode && <HomeGridAllocate className={cx(styles.gridTile, styles.isHigher)} />}
      {!isProjectAdminMode && !isInMigrationMode && (
        <HomeGridCurrentGlmLock className={styles.gridTile} />
      )}
      {!isProjectAdminMode && isInMigrationMode && (
        <HomeGridMigrate className={cx(styles.gridTile, styles.isHigher)} />
      )}
      {!isPatronMode &&
        (isInMigrationMode ? (
          <HomeGridPersonalAllocationMigration className={cx(styles.gridTile, styles.isHigher)} />
        ) : (
          <HomeGridPersonalAllocation className={styles.gridTile} />
        ))}
      {!isInMigrationMode && (
        <>
          {!isProjectAdminMode && <HomeGridUQScore className={styles.gridTile} />}
          {showDivider1 && (
            <HomeGridDivider className={styles.divider1} dataTest={`${dataTestRoot}__divider--1`} />
          )}
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
          {!isProjectAdminMode && !isPatronMode && (
            <HomeGridDonations className={styles.gridTile} />
          )}
          {showDivider2 && (
            <HomeGridDivider className={styles.divider2} dataTest={`${dataTestRoot}__divider--2`} />
          )}
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
        </>
      )}
      {!isProjectAdminMode && isInMigrationMode && (
        <HomeGridCurrentGlmLockMigration className={styles.glmLockMigration} />
      )}
    </Grid>
  );
};

export default window.Cypress ? HomeGrid : memo(HomeGrid);
