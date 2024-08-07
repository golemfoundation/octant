import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useMatchedProjectRewards from 'hooks/queries/useMatchedProjectRewards';
import useProjectsIpfs from 'hooks/queries/useProjectsIpfs';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import bigintAbs from 'utils/bigIntAbs';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import styles from './AllocationSummaryProject.module.scss';
import AllocationSummaryProjectProps from './types';

const AllocationSummaryProject: FC<AllocationSummaryProjectProps> = ({
  address,
  amount,
  simulatedMatched,
  isLoadingAllocateSimulate,
  value,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'views.allocation.allocationItem',
  });
  const isDonationAboveThreshold = useIsDonationAboveThreshold({ projectAddress: address });
  const {
    data: projectIpfs,
    isFetching: isFetchingProjectIpfs,
    isAnyIpfsError,
  } = useProjectsIpfs([address]);

  const { data: matchedProjectRewards } = useMatchedProjectRewards();
  // Real, not simulated threshold is used, because user won't change his decision here.
  const { data: userAllocations } = useUserAllocations();
  const getValuesToDisplay = useGetValuesToDisplay();

  // value can an empty string, which crashes parseUnits. Hence the alternative.
  const valueToUse = value || '0';

  const projectMatchedProjectRewards = matchedProjectRewards?.find(
    ({ address: matchedProjectRewardsAddress }) => address === matchedProjectRewardsAddress,
  );
  const userAllocationToThisProject = userAllocations?.elements.find(
    element => element.address === address,
  )?.value;

  const isNewSimulatedPositive = userAllocationToThisProject
    ? parseUnitsBigInt(valueToUse) >= userAllocationToThisProject
    : true;

  const simulatedMatchedBigInt = simulatedMatched
    ? parseUnitsBigInt(simulatedMatched, 'wei')
    : BigInt(0);

  const yourImpactFormatted =
    valueToUse && simulatedMatched
      ? getValuesToDisplay({
          cryptoCurrency: 'ethereum',
          showCryptoSuffix: true,
          valueCrypto: bigintAbs(
            parseUnitsBigInt(value) +
              simulatedMatchedBigInt -
              (projectMatchedProjectRewards ? projectMatchedProjectRewards.matched : BigInt(0)),
          ),
        })
      : getValuesToDisplay({
          cryptoCurrency: 'ethereum',
          showCryptoSuffix: true,
          valueCrypto: parseUnitsBigInt('0', 'wei'),
        });

  const donationAmountToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    getFormattedEthValueProps: { shouldIgnoreGwei: true },
    valueCrypto: amount,
  }).primary;

  return (
    <div className={styles.root} data-test="AllocationSummaryProject">
      {isFetchingProjectIpfs || isAnyIpfsError ? null : (
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
              {isLoadingAllocateSimulate && t('simulateLoading')}
              {!isLoadingAllocateSimulate &&
                t('simulate', {
                  value: `${isNewSimulatedPositive ? '' : '-'}${yourImpactFormatted.primary}`,
                })}
            </div>
          </div>
          <div className={styles.donation} data-test="AllocationSummaryProject__donation">
            {donationAmountToDisplay}
          </div>
        </>
      )}
    </div>
  );
};

export default AllocationSummaryProject;
