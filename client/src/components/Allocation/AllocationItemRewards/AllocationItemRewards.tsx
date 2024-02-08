import cx from 'classnames';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { motion } from 'framer-motion';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import getFormattedEthValue from 'utils/getFormattedEthValue';
import getRewardsSumWithValueAndSimulation from 'utils/getRewardsSumWithValueAndSimulation';

import styles from './AllocationItemRewards.module.scss';
import AllocationItemRewardsProps from './types';
import { getFilled } from './utils';

const AllocationItemRewards: FC<AllocationItemRewardsProps> = ({
  className,
  address,
  simulatedMatched,
  isError,
  isLoadingAllocateSimulate,
  value,
}) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'views.allocation.allocationItem',
  });
  const { isDesktop } = useMediaQuery();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: userAllocations } = useUserAllocations();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: matchedProposalRewards } = useMatchedProposalRewards();
  const { data: proposalRewardsThreshold } = useProposalRewardsThreshold();
  const [isSimulateVisible, setIsSimulateVisible] = useState<boolean>(false);

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

  const proposalMatchedProposalRewards = matchedProposalRewards?.find(
    ({ address: matchedProposalRewardsAddress }) => address === matchedProposalRewardsAddress,
  );
  const userAllocationToThisProject = userAllocations?.elements.find(
    element => element.address === address,
  )?.value;

  const isNewSimulatedPositive = userAllocationToThisProject
    ? parseUnits(valueToUse).gte(userAllocationToThisProject)
    : true;

  // Before the first allocation, threshold is 0, which should be mapped to not defined.
  const isRewardsDataDefined =
    proposalMatchedProposalRewards !== undefined &&
    proposalRewardsThreshold !== undefined &&
    !proposalRewardsThreshold?.isZero();

  const isThresholdUnknown = isEpoch1 || !isRewardsDataDefined;

  const rewardsSumWithValueAndSimulation = getRewardsSumWithValueAndSimulation(
    valueToUse,
    simulatedMatched,
    simulatedMatched === undefined
      ? proposalMatchedProposalRewards?.sum
      : proposalMatchedProposalRewards?.allocated,
    userAllocationToThisProject,
  );
  const valueFormatted = getFormattedEthValue(parseUnits(valueToUse));
  const simulatedMatchedBigNumber = simulatedMatched
    ? parseUnits(simulatedMatched, 'wei')
    : BigNumber.from(0);
  const simulatedMatchedFormatted = simulatedMatched
    ? getFormattedEthValue(
        simulatedMatchedBigNumber
          .sub(
            proposalMatchedProposalRewards
              ? proposalMatchedProposalRewards.matched
              : BigNumber.from(0),
          )
          .abs(),
      )
    : getFormattedEthValue(parseUnits('0', 'wei'));
  const rewardsSumWithValueAndSimulationFormatted = getFormattedEthValue(
    rewardsSumWithValueAndSimulation,
  );
  const proposalRewardsThresholdFormatted = proposalRewardsThreshold
    ? getFormattedEthValue(proposalRewardsThreshold)
    : undefined;

  const areValueAndSimulatedSuffixesTheSame =
    valueFormatted.suffix === simulatedMatchedFormatted?.suffix;
  const areTotalSuffixesTheSame =
    rewardsSumWithValueAndSimulationFormatted?.suffix === proposalRewardsThresholdFormatted?.suffix;

  const filled = getFilled(proposalRewardsThreshold, rewardsSumWithValueAndSimulation);
  const isDonationAboveThreshold = useIsDonationAboveThreshold({
    proposalAddress: address,
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
      {!isEpoch1 &&
        !isLoadingAllocateSimulate &&
        !isRewardsDataDefined &&
        !simulatedMatched &&
        !isDecisionWindowOpen &&
        i18n.t(isDesktop ? 'common.thresholdDataUnavailable' : 'common.noThresholdData')}
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
              threshold: proposalRewardsThresholdFormatted?.fullString,
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
              {isDecisionWindowOpen && !parseUnits(valueToUse).isZero() && (
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
