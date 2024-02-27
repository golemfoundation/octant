import cx from 'classnames';
import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';
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
  const isDonationAboveThreshold = useIsDonationAboveThreshold({ proposalAddress: address });
  const { data: proposalIpfs, isFetching: isFetchingProposalIpfs } = useProposalsIpfs([address]);

  const { data: matchedProposalRewards } = useMatchedProposalRewards();
  // Real, not simulated threshold is used, because user won't change his decision here.
  const { data: proposalRewardsThreshold } = useProposalRewardsThreshold();
  const { data: userAllocations } = useUserAllocations();

  // value can an empty string, which crashes parseUnits. Hence the alternative.
  const valueToUse = value || '0';

  const proposalMatchedProposalRewards = matchedProposalRewards?.find(
    ({ address: matchedProposalRewardsAddress }) => address === matchedProposalRewardsAddress,
  );
  const userAllocationToThisProject = userAllocations?.elements.find(
    element => element.address === address,
  )?.value;

  const proposalMatchedProposalRewardsFormatted = proposalMatchedProposalRewards
    ? getFormattedEthValue(proposalMatchedProposalRewards?.sum)
    : undefined;
  const proposalRewardsThresholdFormatted =
    proposalRewardsThreshold !== undefined
      ? getFormattedEthValue(proposalRewardsThreshold)
      : undefined;
  const areSuffixesTheSame =
    proposalMatchedProposalRewardsFormatted?.suffix === proposalRewardsThresholdFormatted?.suffix;

  const rewardsSumWithValueAndSimulation = getRewardsSumWithValueAndSimulation(
    valueToUse,
    simulatedMatched,
    simulatedMatched === undefined
      ? proposalMatchedProposalRewards?.sum
      : proposalMatchedProposalRewards?.allocated,
    userAllocationToThisProject,
  );
  const rewardsSumWithValueAndSimulationFormatted = getFormattedEthValue(
    rewardsSumWithValueAndSimulation,
  );

  const donationAmountToDisplay = getFormattedEthValue(amount, true, true);

  return (
    <div className={styles.root}>
      {isFetchingProposalIpfs ? null : (
        <>
          <div className={styles.leftSection}>
            <div className={styles.name}>{proposalIpfs[0].name}</div>
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
                    threshold: proposalRewardsThresholdFormatted?.fullString,
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
