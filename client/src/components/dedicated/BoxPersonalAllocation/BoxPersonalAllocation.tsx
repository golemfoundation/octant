import { format } from 'date-fns-tz';
import { BigNumber } from 'ethers';
import React, { FC, Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import ModalWithdrawEth from 'components/dedicated//ModalWithdrawEth/ModalWithdrawEth';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useSyncStatus from 'hooks/queries/useSyncStatus';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useWithdrawableRewards from 'hooks/queries/useWithdrawableRewards';
import useAllocationsStore from 'store/allocations/store';
import useTransactionLocalStore from 'store/transactionLocal/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './BoxPersonalAllocation.module.scss';
import BoxPersonalAllocationProps from './types';

const BoxPersonalAllocation: FC<BoxPersonalAllocationProps> = ({ className }) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.boxPersonalAllocation',
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { isConnected } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { timeCurrentEpochEnd, timeCurrentAllocationEnd } = useEpochAndAllocationTimestamps();
  const { data: currentEpochProps } = useCurrentEpochProps();
  const { data: userAllocations, isFetching: isFetchingUserAllocations } = useUserAllocations();
  const { data: withdrawableRewards, isFetching: isWithdrawableRewardsFetching } =
    useWithdrawableRewards();
  const { data: individualReward, isFetching: isFetchingIndividualReward } = useIndividualReward();
  const { rewardsForProposals } = useAllocationsStore(state => ({
    rewardsForProposals: state.data.rewardsForProposals,
    setRewardsForProposals: state.setRewardsForProposals,
  }));
  const { isAppWaitingForTransactionToBeIndexed } = useTransactionLocalStore(state => ({
    isAppWaitingForTransactionToBeIndexed: state.data.isAppWaitingForTransactionToBeIndexed,
  }));
  const { data: syncStatusData } = useSyncStatus();

  const isPreLaunch = getIsPreLaunch(currentEpoch);

  const pendingCrypto = individualReward?.sub(rewardsForProposals);

  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();

  const sections: SectionProps[] = [
    ...(!isProjectAdminMode
      ? [
          {
            doubleValueProps: {
              cryptoCurrency: 'ethereum',
              isFetching: isFetchingIndividualReward || isFetchingUserAllocations,
              valueCrypto:
                syncStatusData?.finalizedSnapshot === 'done' ||
                !userAllocations?.hasUserAlreadyDoneAllocation
                  ? BigNumber.from(0)
                  : pendingCrypto,
            },
            label: isPatronMode ? t('currentEpoch') : t('pending'),
            tooltipProps: isPatronMode
              ? undefined
              : {
                  position: 'bottom-right',
                  text: (
                    <div className={styles.pendingTooltip}>
                      <div className={styles.pendingTooltipLabel}>
                        {t('pendingFundsAvailableAfter')}
                      </div>
                      <div className={styles.pendingTooltipDate}>
                        {/* TODO OCT-1041 fetch next epoch props instead of assuming the same length */}
                        {currentEpochProps && timeCurrentEpochEnd && timeCurrentAllocationEnd
                          ? format(
                              new Date(
                                isDecisionWindowOpen
                                  ? timeCurrentAllocationEnd
                                  : timeCurrentEpochEnd + currentEpochProps.decisionWindow,
                              ),
                              'haaa z, d LLLL',
                            )
                          : ''}
                      </div>
                    </div>
                  ),
                },
          } as SectionProps,
        ]
      : []),
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: isWithdrawableRewardsFetching || isAppWaitingForTransactionToBeIndexed,
        valueCrypto: currentEpoch === 1 ? BigNumber.from(0) : withdrawableRewards?.sum,
      },
      label: isPatronMode && !isProjectAdminMode ? t('allTime') : i18n.t('common.availableNow'),
    },
  ];

  const title = useMemo(() => {
    if (isProjectAdminMode) {
      return i18n.t('common.donations');
    }
    if (isPatronMode) {
      return t('patronEarnings');
    }
    return t('personalAllocation');
  }, [isProjectAdminMode, isPatronMode, i18n, t]);

  return (
    <Fragment>
      <BoxRounded
        alignment="left"
        buttonProps={
          isPatronMode && !isProjectAdminMode
            ? undefined
            : {
                dataTest: 'BoxPersonalAllocation__Button',
                isDisabled:
                  isPreLaunch ||
                  !isConnected ||
                  isWithdrawableRewardsFetching ||
                  isAppWaitingForTransactionToBeIndexed ||
                  withdrawableRewards?.sum.isZero(),
                isHigh: true,
                label: t('withdrawToWallet'),
                onClick: () => setIsModalOpen(true),
                variant: isProjectAdminMode ? 'cta' : 'secondary',
              }
        }
        className={className}
        dataTest="BoxPersonalAllocation"
        hasSections
        isVertical
        title={title}
      >
        <Sections sections={sections} />
      </BoxRounded>
      <ModalWithdrawEth
        modalProps={{
          isOpen: isModalOpen,
          onClosePanel: () => setIsModalOpen(false),
        }}
      />
    </Fragment>
  );
};

export default BoxPersonalAllocation;
