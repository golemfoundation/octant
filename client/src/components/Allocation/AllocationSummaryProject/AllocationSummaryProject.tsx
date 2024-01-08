import cx from 'classnames';
import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';
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
  const { data: proposalRewardsThreshold } = useProposalRewardsThreshold();

  const proposalMatchedProposalRewards = matchedProposalRewards?.find(
    ({ address: matchedProposalRewardsAddress }) => address === matchedProposalRewardsAddress,
  );

  const proposalMatchedProposalRewardsFormatted = proposalMatchedProposalRewards
    ? getFormattedEthValue(proposalMatchedProposalRewards?.sum)
    : undefined;
  const proposalRewardsThresholdFormatted = proposalRewardsThreshold
    ? getFormattedEthValue(proposalRewardsThreshold)
    : undefined;
  const areSuffixesTheSame =
    proposalMatchedProposalRewardsFormatted?.suffix === proposalRewardsThresholdFormatted?.suffix;

  // value can an empty string, which crashes parseUnits. Hence the alternative.
  const valueToUse = value || '0';
  const rewardsSumWithValueAndSimulation = getRewardsSumWithValueAndSimulation(
    valueToUse,
    simulatedMatched,
    proposalMatchedProposalRewards?.sum,
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
