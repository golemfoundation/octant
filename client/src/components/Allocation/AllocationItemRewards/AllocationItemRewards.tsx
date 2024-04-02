import cx from 'classnames';
import { motion } from 'framer-motion';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useAccount } from 'wagmi';

import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProjectRewards from 'hooks/queries/useMatchedProjectRewards';
import useProjectRewardsThreshold from 'hooks/queries/useProjectRewardsThreshold';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import getFormattedEthValue from 'utils/getFormattedEthValue';
import getRewardsSumWithValueAndSimulation from 'utils/getRewardsSumWithValueAndSimulation';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import styles from './AllocationItemRewards.module.scss';
import AllocationItemRewardsProps from './types';
import { getFilled } from './utils';

const bigintAbs = (n: bigint): bigint => (n < 0n ? -n : n);

const AllocationItemRewards: FC<AllocationItemRewardsProps> = ({
  className,
  address,
  simulatedMatched,
  isError,
  isLoadingAllocateSimulate,
  simulatedThreshold,
  value,
}) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'views.allocation.allocationItem',
  });
  const { isDesktop } = useMediaQuery();
  const { isConnected } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: individualReward } = useIndividualReward();
  const { data: userAllocations } = useUserAllocations();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: matchedProjectRewards } = useMatchedProjectRewards();
  const { data: projectRewardsThreshold } = useProjectRewardsThreshold();
  const [isSimulateVisible, setIsSimulateVisible] = useState<boolean>(false);

  const thresholdToUse = individualReward === 0n ? projectRewardsThreshold : simulatedThreshold;

  // value can an empty string, which crashes parseUnits. Hence the alternative.
  const valueToUse = value || '0';

  const onClick = () => {
    if (!isDesktop) {
      setIsSimulateVisible(_isSimulateVisible => !_isSimulateVisible);
    }
  };

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

  const isEpoch1 = currentEpoch === 1;

  const projectMatchedProjectRewards = matchedProjectRewards?.find(
    ({ address: matchedProjectRewardsAddress }) => address === matchedProjectRewardsAddress,
  );
  const userAllocationToThisProject = userAllocations?.elements.find(
    element => element.address === address,
  )?.value;

  const isNewSimulatedPositive = userAllocationToThisProject
    ? parseUnitsBigInt(valueToUse) >= userAllocationToThisProject
    : true;

  // Before the first allocation, threshold is 0, which should be mapped to not defined.
  const isRewardsDataDefined =
    projectMatchedProjectRewards !== undefined &&
    thresholdToUse !== undefined &&
    thresholdToUse !== 0n;

  const isThresholdUnknown = isEpoch1 || !isRewardsDataDefined;

  const rewardsSumWithValueAndSimulation = getRewardsSumWithValueAndSimulation(
    valueToUse,
    simulatedMatched,
    simulatedMatched === undefined
      ? projectMatchedProjectRewards?.sum
      : projectMatchedProjectRewards?.allocated,
    userAllocationToThisProject,
  );
  const valueFormatted = getFormattedEthValue(parseUnitsBigInt(valueToUse));
  const simulatedMatchedBigInt = simulatedMatched
    ? parseUnitsBigInt(simulatedMatched, 'wei')
    : BigInt(0);
  const simulatedMatchedFormatted = simulatedMatched
    ? getFormattedEthValue(
        bigintAbs(
          simulatedMatchedBigInt -
            (projectMatchedProjectRewards ? projectMatchedProjectRewards.matched : BigInt(0)),
        ),
      )
    : getFormattedEthValue(parseUnitsBigInt('0', 'wei'));
  const rewardsSumWithValueAndSimulationFormatted = getFormattedEthValue(
    rewardsSumWithValueAndSimulation,
  );
  const thresholdToUseFormatted = getFormattedEthValue(thresholdToUse || BigInt(0));

  const areValueAndSimulatedSuffixesTheSame =
    valueFormatted.suffix === simulatedMatchedFormatted?.suffix;
  const areTotalSuffixesTheSame =
    rewardsSumWithValueAndSimulationFormatted?.suffix === thresholdToUseFormatted?.suffix;

  const filled = getFilled(thresholdToUse, rewardsSumWithValueAndSimulation);
  const isDonationAboveThreshold = useIsDonationAboveThreshold({
    projectAddress: address,
    rewardsSumWithValueAndSimulation,
  });

  return (
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <div
      className={cx(
        styles.root,
        className,
        isLoadingAllocateSimulate && styles.isLoadingAllocateSimulate,
        isSimulateVisible && styles.isSimulateVisible,
        isRewardsDataDefined && styles.isRewardsDataDefined,
        isDecisionWindowOpen && styles.isDecisionWindowOpen,
        !isEpoch1 &&
          !isThresholdUnknown &&
          isDonationAboveThreshold &&
          styles.isDonationAboveThreshold,
      )}
      onClick={onClick}
      onMouseLeave={() => setIsSimulateVisible(false)}
      // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
      onMouseOver={() => setIsSimulateVisible(true)}
    >
      {isEpoch1 && t('epoch1')}
      {(!isDecisionWindowOpen ||
        (!isEpoch1 &&
          !isLoadingAllocateSimulate &&
          !isRewardsDataDefined &&
          !simulatedMatched &&
          !isDecisionWindowOpen &&
          !isConnected)) &&
        i18n.t(
          isDesktop
            ? 'common.thresholdDataUnavailable.desktop'
            : 'common.thresholdDataUnavailable.mobile',
        )}
      {!isEpoch1 && isLoadingAllocateSimulate && i18n.t('common.calculating')}
      {!isEpoch1 &&
        isDecisionWindowOpen &&
        !isLoadingAllocateSimulate &&
        (isSimulateVisible ? (
          <Trans
            i18nKey={
              isDesktop
                ? 'views.allocation.allocationItem.simulate.desktop'
                : 'views.allocation.allocationItem.simulate.mobile'
            }
            values={{
              character: isNewSimulatedPositive ? '+' : '-',
              matched: simulatedMatchedFormatted.fullString,
              value: areValueAndSimulatedSuffixesTheSame
                ? valueFormatted?.value
                : valueFormatted?.fullString,
            }}
          />
        ) : (
          <Trans
            i18nKey="views.allocation.allocationItem.standard"
            values={{
              sum: areTotalSuffixesTheSame
                ? rewardsSumWithValueAndSimulationFormatted?.value
                : rewardsSumWithValueAndSimulationFormatted?.fullString,
              threshold: thresholdToUseFormatted?.fullString,
            }}
          />
        ))}

      {(!isEpoch1 || isLoadingAllocateSimulate) && (
        <div className={styles.progressBar}>
          {isLoadingAllocateSimulate ? (
            <div className={styles.simulateLoader} />
          ) : (
            <div
              className={cx(styles.filled, isError && styles.isError)}
              style={{ width: `${isDecisionWindowOpen ? filled : 0}%` }}
            >
              {isDecisionWindowOpen && parseUnitsBigInt(valueToUse) !== 0n && (
                <svg
                  className={styles.linearGradientSvg}
                  height="2"
                  viewBox={`0 0 ${filled} 2`}
                  width={filled}
                >
                  <motion.rect
                    key={`linear-gradient-${filled}`}
                    animate={{ x: [-192, filled] }}
                    fill="url(#linear_gradient)"
                    height="2"
                    rx="1"
                    transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
                    width={192}
                  />
                  <defs>
                    <linearGradient id="linear_gradient">
                      <stop stopColor={styles.colorOctantOrange5} />
                      <stop offset="0.260417" stopColor={styles.colorOctantOrange} />
                      <stop offset="0.510417" stopColor={styles.colorOctantOrange5} />
                      <stop offset="0.760417" stopColor={styles.colorOctantOrange} />
                      <stop offset="0.994792" stopColor={styles.colorOctantOrange5} />
                    </linearGradient>
                  </defs>
                </svg>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllocationItemRewards;
