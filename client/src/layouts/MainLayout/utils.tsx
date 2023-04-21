import cx from 'classnames';
import { BigNumber } from 'ethers';
import React, { LegacyRef } from 'react';

import Svg from 'components/core/Svg/Svg';
import { IS_INITIAL_LOAD_DONE } from 'constants/dataAttributes';
import { navigationTabs as navigationTabsDefault } from 'constants/navigationTabs/navigationTabs';
import { NavigationTab } from 'constants/navigationTabs/types';
import { allocateWithNumber } from 'svg/navigation';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './MainLayout.module.scss';

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
  return `Budget ${getFormattedEthValue(individualReward).fullString}`;
}

export function getNavigationTabsWithAllocations(
  idsInAllocation: string[] | undefined,
  isAllocationValueChanging: boolean,
  numberOfAllocationsRef?: LegacyRef<HTMLDivElement> | undefined,
  navigationTabs = navigationTabsDefault,
): NavigationTab[] {
  const dataAttributes = {
    [IS_INITIAL_LOAD_DONE]: 'false',
  };
  const newNavigationTabs = [...navigationTabs];
  newNavigationTabs[1] =
    idsInAllocation && idsInAllocation.length > 0
      ? {
          ...newNavigationTabs[1],
          iconWrapped: (
            <div className={styles.iconNumberOfAllocations}>
              <div
                ref={numberOfAllocationsRef}
                className={cx(
                  styles.numberOfAllocations,
                  isAllocationValueChanging && styles.isAllocationValueChanging,
                )}
                {...dataAttributes}
              >
                {idsInAllocation.length}
              </div>
              <Svg img={allocateWithNumber} size={3.2} />
            </div>
          ),
        }
      : newNavigationTabs[1];
  return newNavigationTabs;
}
