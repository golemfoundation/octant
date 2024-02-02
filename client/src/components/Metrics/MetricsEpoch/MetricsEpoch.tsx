import { BigNumber } from 'ethers';
import React, { ReactElement } from 'react';

import MetricsEpochGridAverageLeverage from 'components/Metrics/MetricsEpoch/MetricsEpochGridAverageLeverage';
import MetricsEpochGridBelowThreshold from 'components/Metrics/MetricsEpoch/MetricsEpochGridBelowThreshold';
import MetricsEpochGridCurrentDonors from 'components/Metrics/MetricsEpoch/MetricsEpochGridCurrentDonors';
import MetricsEpochGridDonationsVsPersonalAllocations from 'components/Metrics/MetricsEpoch/MetricsEpochGridDonationsVsPersonalAllocations';
import MetricsEpochGridFundsUsage from 'components/Metrics/MetricsEpoch/MetricsEpochGridFundsUsage';
import MetricsEpochGridPatrons from 'components/Metrics/MetricsEpoch/MetricsEpochGridPatrons';
import MetricsEpochGridRewardsUnusedAndUnallocatedValue from 'components/Metrics/MetricsEpoch/MetricsEpochGridRewardsUnusedAndUnallocatedValue';
import MetricsEpochGridTopProjects from 'components/Metrics/MetricsEpoch/MetricsEpochGridTopProjects';
import MetricsEpochGridTotalDonationsAndPersonal from 'components/Metrics/MetricsEpoch/MetricsEpochGridTotalDonationsAndPersonal';
import MetricsEpochGridTotalUsers from 'components/Metrics/MetricsEpoch/MetricsEpochGridTotalUsers';
import MetricsEpochHeader from 'components/Metrics/MetricsEpoch/MetricsEpochHeader';
import MetricsGrid from 'components/Metrics/MetricsGrid';
import { METRICS_EPOCH_ID } from 'constants/metrics';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useProposalsDonors from 'hooks/queries/donors/useProposalsDonors';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useCurrentEpochEnd from 'hooks/queries/useCurrentEpochEnd';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import useEpochAllocations from 'hooks/queries/useEpochAllocations';
import useEpochBudgets from 'hooks/queries/useEpochBudgets';
import useEpochInfo from 'hooks/queries/useEpochInfo';
import useEpochLeverage from 'hooks/queries/useEpochLeverage';
import useEpochPatrons from 'hooks/queries/useEpochPatrons';
import useEpochUnusedRewards from 'hooks/queries/useEpochUnusedRewards';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';
import useProposalsIpfsWithRewards from 'hooks/queries/useProposalsIpfsWithRewards';
import useEpochsStartEndTime from 'hooks/subgraph/useEpochsStartEndTime';
import useLargestLockedAmount from 'hooks/subgraph/useLargestLockedAmount';
import useLockedsData from 'hooks/subgraph/useLockedsData';

import styles from './MetricsEpoch.module.scss';

const MetricsEpoch = (): ReactElement => {
  const { epoch, lastEpoch } = useMetricsEpoch();
  const { isFetching: isFetchingCurrentEpoch } = useCurrentEpoch();
  const { isFetching: isFetchingCurrentEpochProps } = useCurrentEpochProps();
  const { data: isDecisionWindowOpen, isFetching: isFetchingDecisionWindow } =
    useIsDecisionWindowOpen();
  const { isFetching: isFetchingLockedsData } = useLockedsData();
  const { isFetching: isFetchingLargestLockedAmount } = useLargestLockedAmount();
  const { isFetching: isFetchingCurrentEpochEnd } = useCurrentEpochEnd();
  const { isFetching: isFetchingEpochsStartEndTime } = useEpochsStartEndTime();
  const { isFetching: isFetchingMatchedProposalRewards } = useMatchedProposalRewards(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );
  const { isFetching: isFetchingProposalsIpfsWithRewards } = useProposalsIpfsWithRewards(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );
  const { isFetching: isFetchingProposalsDonors } = useProposalsDonors(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );
  const { isFetching: isFetchingProposalRewardsThreshold } = useProposalRewardsThreshold(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );
  const { isFetching: isFetchingEpochLeverage } = useEpochLeverage(epoch);
  const { data: epochAllocations, isFetching: isFetchingEpochAllocations } =
    useEpochAllocations(epoch);
  const { data: epochInfo, isFetching: isFetchingEpochInfo } = useEpochInfo(epoch);
  const { isFetching: isFetchingEpochPatrons } = useEpochPatrons(epoch);
  const { data: epochBudgets, isFetching: isFetchingEpochBudgets } = useEpochBudgets(epoch);
  const { data: epochUnusedRewards, isFetching: isFetchingEpochUnusedRewards } =
    useEpochUnusedRewards(epoch);

  const patronsRewards = epochInfo?.patronsRewards || BigNumber.from(0);
  const sumOfDonations =
    epochAllocations?.reduce((acc, curr) => acc.add(curr.amount), BigNumber.from(0)) ||
    BigNumber.from(0);
  const totalDonations = sumOfDonations.add(patronsRewards);
  const unusedRewards = epochUnusedRewards?.value || BigNumber.from(0);
  const epochBudget = epochBudgets?.budgetsSum || BigNumber.from(0);

  const totalPersonal = epochBudget.sub(totalDonations).sub(unusedRewards);

  // All metrics should be visible in the same moment (design). Skeletons are visible to the end of fetching all needed data.
  const isLoading =
    isFetchingLargestLockedAmount ||
    isFetchingCurrentEpoch ||
    isFetchingCurrentEpochProps ||
    isFetchingDecisionWindow ||
    isFetchingLockedsData ||
    isFetchingCurrentEpochEnd ||
    isFetchingEpochsStartEndTime ||
    isFetchingProposalsIpfsWithRewards ||
    isFetchingEpochAllocations ||
    isFetchingEpochInfo ||
    isFetchingEpochLeverage ||
    isFetchingEpochUnusedRewards ||
    isFetchingEpochBudgets ||
    isFetchingMatchedProposalRewards ||
    isFetchingProposalsDonors ||
    isFetchingProposalRewardsThreshold ||
    isFetchingEpochPatrons;

  return (
    <div className={styles.root} id={METRICS_EPOCH_ID}>
      <MetricsEpochHeader />
      <MetricsGrid className={styles.grid} dataTest="MetricsEpoch__MetricsGrid">
        <MetricsEpochGridTopProjects className={styles.topProjects} isLoading={isLoading} />
        <MetricsEpochGridTotalDonationsAndPersonal
          className={styles.totalDonationsAndPersonal}
          isLoading={isLoading}
          totalDonations={totalDonations}
          totalPersonal={totalPersonal}
        />
        <MetricsEpochGridDonationsVsPersonalAllocations
          className={styles.donationsVsPersonal}
          isLoading={isLoading}
          totalDonations={totalDonations}
          totalPersonal={totalPersonal}
        />
        <MetricsEpochGridFundsUsage className={styles.fundsUsage} isLoading={isLoading} />
        <MetricsEpochGridTotalUsers className={styles.totalUsers} isLoading={isLoading} />
        <MetricsEpochGridPatrons className={styles.patrons} isLoading={isLoading} />
        <MetricsEpochGridCurrentDonors className={styles.currentDonors} isLoading={isLoading} />
        <MetricsEpochGridAverageLeverage className={styles.averageLeverage} isLoading={isLoading} />
        <MetricsEpochGridRewardsUnusedAndUnallocatedValue
          className={styles.unusedAndUnallocatedValue}
          isLoading={isLoading}
        />
        <MetricsEpochGridBelowThreshold className={styles.belowThreshold} isLoading={isLoading} />
      </MetricsGrid>
    </div>
  );
};

export default MetricsEpoch;
