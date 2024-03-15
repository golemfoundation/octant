import cx from 'classnames';
import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useMatchedProjectRewards from 'hooks/queries/useMatchedProjectRewards';
import useProjectRewardsThreshold from 'hooks/queries/useProjectRewardsThreshold';
import useProjectsIpfs from 'hooks/queries/useProjectsIpfs';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import getFormattedEthValue from 'utils/getFormattedEthValue';
import getRewardsSumWithValueAndSimulation from 'utils/getRewardsSumWithValueAndSimulation';

import styles from './AllocationSummaryProject.module.scss';
import AllocationSummaryProjectProps from './types';

const AllocationSummaryProject: FC<AllocationSummaryProjectProps> = ({
  address,
  amount,
  simulatedMatched,
  isLoadingAllocateSimulate,
  value,
}) => {
  const { i18n } = useTranslation('translation');
  const isDonationAboveThreshold = useIsDonationAboveThreshold({ projectAddress: address });
  const { data: projectIpfs, isFetching: isFetchingProjectIpfs } = useProjectsIpfs([address]);

  const { data: matchedProjectRewards } = useMatchedProjectRewards();
  // Real, not simulated threshold is used, because user won't change his decision here.
  const { data: projectRewardsThreshold } = useProjectRewardsThreshold();
  const { data: userAllocations } = useUserAllocations();

  // value can an empty string, which crashes parseUnits. Hence the alternative.
  const valueToUse = value || '0';

  const projectMatchedProjectRewards = matchedProjectRewards?.find(
    ({ address: matchedProjectRewardsAddress }) => address === matchedProjectRewardsAddress,
  );
  const userAllocationToThisProject = userAllocations?.elements.find(
    element => element.address === address,
  )?.value;

  const projectMatchedProjectRewardsFormatted = projectMatchedProjectRewards
    ? getFormattedEthValue(projectMatchedProjectRewards?.sum)
    : undefined;
  const projectRewardsThresholdFormatted =
    projectRewardsThreshold !== undefined
      ? getFormattedEthValue(projectRewardsThreshold)
      : undefined;
  const areSuffixesTheSame =
    projectMatchedProjectRewardsFormatted?.suffix === projectRewardsThresholdFormatted?.suffix;

  const rewardsSumWithValueAndSimulation = getRewardsSumWithValueAndSimulation(
    valueToUse,
    simulatedMatched,
    simulatedMatched === undefined
      ? projectMatchedProjectRewards?.sum
      : projectMatchedProjectRewards?.allocated,
    userAllocationToThisProject,
  );
  const rewardsSumWithValueAndSimulationFormatted = getFormattedEthValue(
    rewardsSumWithValueAndSimulation,
  );

  const donationAmountToDisplay = getFormattedEthValue(amount, true, true);

  return (
    <div className={styles.root}>
      {isFetchingProjectIpfs ? null : (
        <>
          <div className={styles.leftSection}>
            <div className={styles.name}>{projectIpfs[0].name}</div>
            <div
              className={cx(
                styles.value,
                isDonationAboveThreshold && styles.isDonationAboveThreshold,
                isLoadingAllocateSimulate && styles.isLoadingAllocateSimulate,
              )}
            >
              {isLoadingAllocateSimulate ? (
                i18n.t('common.calculating')
              ) : (
                <Trans
                  i18nKey="views.allocation.allocationItem.standard"
                  values={{
                    sum: areSuffixesTheSame
                      ? rewardsSumWithValueAndSimulationFormatted?.value
                      : rewardsSumWithValueAndSimulationFormatted?.fullString,
                    threshold: projectRewardsThresholdFormatted?.fullString,
                  }}
                />
              )}
            </div>
          </div>
          <div className={styles.donation}>{donationAmountToDisplay.value}</div>
        </>
      )}
    </div>
  );
};

export default AllocationSummaryProject;
