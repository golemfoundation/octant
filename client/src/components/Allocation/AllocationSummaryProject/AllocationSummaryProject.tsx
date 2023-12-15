import cx from 'classnames';
import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './AllocationSummaryProject.module.scss';
import AllocationSummaryProjectProps from './types';

const AllocationSummaryProject: FC<AllocationSummaryProjectProps> = ({ address, amount }) => {
  const isDonationAboveThreshold = useIsDonationAboveThreshold(address);
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
              )}
            >
              <Trans
                components={[<span className={styles.donationBelowThreshold} />]}
                i18nKey="views.allocation.allocationItem.standard"
                values={{
                  sum: areSuffixesTheSame
                    ? proposalMatchedProposalRewardsFormatted?.value
                    : proposalMatchedProposalRewardsFormatted?.fullString,
                  threshold: proposalRewardsThresholdFormatted?.fullString,
                }}
              />
            </div>
          </div>
          <div className={styles.donation}>{donationAmountToDisplay.value}</div>
        </>
      )}
    </div>
  );
};

export default AllocationSummaryProject;
