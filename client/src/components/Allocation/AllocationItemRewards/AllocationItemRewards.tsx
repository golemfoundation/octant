import cx from 'classnames';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Svg from 'components/ui/Svg';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useProjectDonors from 'hooks/queries/donors/useProjectDonors';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProjectRewards from 'hooks/queries/useMatchedProjectRewards';
import useUqScore from 'hooks/queries/useUqScore';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import { person } from 'svg/misc';
import bigintAbs from 'utils/bigIntAbs';
import getRewardsSumWithValueAndSimulation from 'utils/getRewardsSumWithValueAndSimulation';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import styles from './AllocationItemRewards.module.scss';
import AllocationItemRewardsProps, { AllocationItemRewardsDonorsProps } from './types';

const AllocationItemRewardsDonors: FC<AllocationItemRewardsDonorsProps> = ({
  isError,
  isLoadingAllocateSimulate,
  isSimulateVisible,
  isSimulatedMatchedAvailable,
  projectDonors,
  userAllocationToThisProject,
  valueToUse,
}) => {
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const shouldBeVisible =
    !isSimulateVisible && !isLoadingAllocateSimulate && (projectDonors || !isDecisionWindowOpen);

  const numberOfDonors = useMemo(() => {
    if (!isDecisionWindowOpen || !projectDonors) {
      return 0;
    }
    if (
      isDecisionWindowOpen &&
      !!projectDonors &&
      isSimulatedMatchedAvailable &&
      [undefined, 0n].includes(userAllocationToThisProject)
    ) {
      return projectDonors.length + 1;
    }
    if (
      isDecisionWindowOpen &&
      !!projectDonors &&
      userAllocationToThisProject &&
      userAllocationToThisProject > 0n &&
      ['0', ''].includes(valueToUse) &&
      isSimulatedMatchedAvailable
    ) {
      return projectDonors.length - 1;
    }
    return projectDonors.length;
  }, [
    isDecisionWindowOpen,
    projectDonors,
    isSimulatedMatchedAvailable,
    userAllocationToThisProject,
    valueToUse,
  ]);

  if (!shouldBeVisible) {
    return <div />;
  }

  return (
    <div
      className={cx(
        styles.element,
        isDecisionWindowOpen && styles.isDecisionWindowOpen,
        isSimulatedMatchedAvailable && styles.isSimulatedMatchedAvailable,
        isError && styles.isError,
      )}
      data-test="AllocationItemRewardsDonors"
    >
      <Svg
        classNameSvg={cx(
          styles.icon,
          isSimulatedMatchedAvailable && styles.isSimulatedMatchedAvailable,
        )}
        img={person}
        size={1.2}
      />
      {numberOfDonors}
    </div>
  );
};

const AllocationItemRewards: FC<AllocationItemRewardsProps> = ({
  address,
  simulatedMatched,
  isError,
  isLoadingAllocateSimulate,
  value,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'views.allocation.allocationItem',
  });
  const [isSimulateVisible, setIsSimulateVisible] = useState<boolean>(false);
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: userAllocations } = useUserAllocations();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: matchedProjectRewards } = useMatchedProjectRewards();
  const { data: uqScore } = useUqScore(currentEpoch! - 1);

  const { data: projectDonors } = useProjectDonors(address);

  // value can an empty string, which crashes parseUnits. Hence the alternative.
  const valueToUse = value || '0';

  useEffect(() => {
    if (simulatedMatched === undefined) {
      return;
    }
    setIsSimulateVisible(true);

    const timeout = setTimeout(() => {
      setIsSimulateVisible(false);
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [simulatedMatched]);

  const projectMatchedProjectRewards = matchedProjectRewards?.find(
    ({ address: matchedProjectRewardsAddress }) => address === matchedProjectRewardsAddress,
  );
  const userAllocationToThisProject = userAllocations?.elements.find(
    element => element.address === address,
  )?.value;

  const getValuesToDisplay = useGetValuesToDisplay();

  const isNewSimulatedPositive = userAllocationToThisProject
    ? parseUnitsBigInt(valueToUse) >= userAllocationToThisProject
    : true;

  const simulatedMatchedBigInt = simulatedMatched
    ? parseUnitsBigInt(simulatedMatched, 'wei')
    : BigInt(0);

  const rewardsSumWithValueAndSimulation = getRewardsSumWithValueAndSimulation(
    valueToUse,
    simulatedMatchedBigInt,
    simulatedMatched === undefined
      ? projectMatchedProjectRewards?.sum
      : projectMatchedProjectRewards?.allocated,
    userAllocationToThisProject,
    uqScore,
  );

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
  const rewardsSumWithValueAndSimulationFormatted = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: rewardsSumWithValueAndSimulation,
  });
  const isSimulatedMatchedAvailable =
    !!simulatedMatched && parseUnitsBigInt(simulatedMatched, 'wei') > 0;

  return (
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <div className={styles.root} data-test="AllocationItemRewards">
      <div
        className={cx(
          styles.element,
          isDecisionWindowOpen && styles.isDecisionWindowOpen,
          isError && styles.isError,
          isLoadingAllocateSimulate && styles.isLoadingAllocateSimulate,
          !isLoadingAllocateSimulate &&
            isSimulatedMatchedAvailable &&
            styles.isSimulatedMatchedAvailable,
        )}
        data-test="AllocationItemRewards__value"
      >
        {isDecisionWindowOpen && isLoadingAllocateSimulate && t('simulateLoading')}
        {isDecisionWindowOpen &&
          !isLoadingAllocateSimulate &&
          isSimulateVisible &&
          t('simulate', {
            value: `${isNewSimulatedPositive ? '' : '-'}${yourImpactFormatted.primary}`,
          })}
        {isDecisionWindowOpen &&
          !isLoadingAllocateSimulate &&
          !isSimulateVisible &&
          rewardsSumWithValueAndSimulationFormatted.primary}
        {!isDecisionWindowOpen &&
          getValuesToDisplay({
            cryptoCurrency: 'ethereum',
            showCryptoSuffix: true,
            valueCrypto: 0n,
          }).primary}
      </div>
      <AllocationItemRewardsDonors
        isError={isError}
        isLoadingAllocateSimulate={isLoadingAllocateSimulate}
        isSimulatedMatchedAvailable={isSimulatedMatchedAvailable}
        isSimulateVisible={isSimulateVisible}
        projectDonors={projectDonors}
        userAllocationToThisProject={userAllocationToThisProject}
        valueToUse={valueToUse}
      />
    </div>
  );
};

export default AllocationItemRewards;
