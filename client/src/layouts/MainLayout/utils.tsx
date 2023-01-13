import { BigNumber } from 'ethers';
import React from 'react';

import { NavigationTab } from 'constants/navigationTabs/types';
import { allocateWithNumber } from 'svg/navigation';
import { navigationTabs as navigationTabsDefault } from 'constants/navigationTabs/navigationTabs';
import Svg from 'components/core/Svg/Svg';
import getFormattedUnits from 'utils/getFormattedUnit';

import styles from './style.module.scss';

export function getIndividualRewardText({
  individualReward,
  currentEpoch,
}: {
  currentEpoch?: number;
  individualReward?: BigNumber;
}): string {
  if (currentEpoch !== undefined && currentEpoch === 1) {
    return 'No reward budget yet';
  }
  if (currentEpoch === undefined || individualReward === undefined) {
    return 'Loading reward budget...';
  }
  if (individualReward.isZero()) {
    return 'No reward budget yet';
  }
  return `Budget ${getFormattedUnits(individualReward)}`;
}

export function getNavigationTabsWithAllocations(
  idsInAllocation: number[] | undefined,
  navigationTabs = navigationTabsDefault,
): NavigationTab[] {
  const newNavigationTabs = [...navigationTabs];
  newNavigationTabs[1] =
    idsInAllocation && idsInAllocation.length > 0
      ? {
          ...newNavigationTabs[1],
          iconWrapped: (
            <div className={styles.iconNumberOfAllocations}>
              <div className={styles.numberOfAllocations}>{idsInAllocation.length}</div>
              <Svg img={allocateWithNumber} size={3.2} />
            </div>
          ),
        }
      : newNavigationTabs[1];
  return newNavigationTabs;
}
