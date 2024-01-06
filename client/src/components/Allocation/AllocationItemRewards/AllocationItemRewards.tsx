import cx from 'classnames';
import { parseUnits } from 'ethers/lib/utils';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './AllocationItemRewards.module.scss';
import AllocationItemRewardsProps from './types';
import { getFilled, getRewardsSumWithValueAndSimulation } from './utils';

const AllocationItemRewards: FC<AllocationItemRewardsProps> = ({
  className,
  address,
  simulatedMatched,
  isLoadingAllocateSimulate,
  value = '0',
}) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'views.allocation.allocationItem',
  });
  const { isDesktop } = useMediaQuery();
  const { data: currentEpoch } = useCurrentEpoch();
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

  // Before the first allocation, threshold is 0, which should be mapped to not defined.
  const isRewardsDataDefined =
    proposalMatchedProposalRewards !== undefined &&
    proposalRewardsThreshold !== undefined &&
    !proposalRewardsThreshold?.isZero();

  const isThresholdUnknown = isEpoch1 || !isRewardsDataDefined;

  const rewardsSumWithValueAndSimulation = getRewardsSumWithValueAndSimulation(
    valueToUse,
    simulatedMatched,
    proposalMatchedProposalRewards?.sum,
  );
  const valueFormatted = getFormattedEthValue(parseUnits(valueToUse));
  const simulatedMatchedFormatted = simulatedMatched
    ? getFormattedEthValue(parseUnits(simulatedMatched, 'wei'))
    : undefined;
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
        (isEpoch1 || isThresholdUnknown) && styles.isThresholdUnknown,
        !isEpoch1 &&
          !isThresholdUnknown &&
          isDonationAboveThreshold &&
          styles.isDonationAboveThreshold,
        isLoadingAllocateSimulate && styles.isLoadingAllocateSimulate,
      )}
      onClick={onClick}
      onMouseLeave={() => {
        setIsSimulateVisible(false);
      }}
      onMouseOver={() => {
        setIsSimulateVisible(true);
      }}
    >
      {isEpoch1 && t('epoch1')}
      {!isEpoch1 &&
        !isLoadingAllocateSimulate &&
        !isRewardsDataDefined &&
        !simulatedMatched &&
        i18n.t(isDesktop ? 'common.thresholdDataUnavailable' : 'common.noThresholdData')}
      {!isEpoch1 && isLoadingAllocateSimulate && i18n.t('common.calculating')}
      {!isEpoch1 &&
        !isLoadingAllocateSimulate &&
        (isRewardsDataDefined || simulatedMatched) &&
        (isSimulateVisible ? (
          <Trans
            i18nKey="views.allocation.allocationItem.simulate"
            values={{
              matched: simulatedMatchedFormatted
                ? `+ ${simulatedMatchedFormatted?.fullString}`
                : '',
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
      {!isEpoch1 && (isLoadingAllocateSimulate || filled < 100) && (
        <div className={styles.progressBar}>
          {!isLoadingAllocateSimulate && (
            <div
              className={cx(styles.filled, !parseUnits(valueToUse).isZero() && styles.isPulsing)}
              style={{ width: `${filled}%` }}
            />
          )}
          {isLoadingAllocateSimulate && <div className={styles.simulateLoader} />}
        </div>
      )}
    </div>
  );
};

export default AllocationItemRewards;
