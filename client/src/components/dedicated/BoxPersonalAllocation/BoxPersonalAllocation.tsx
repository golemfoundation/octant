import { format } from 'date-fns-tz';
import { BigNumber } from 'ethers';
import React, { FC, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import ModalWithdrawEth from 'components/dedicated//ModalWithdrawEth/ModalWithdrawEth';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useSyncStatus from 'hooks/queries/useSyncStatus';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useWithdrawableRewards from 'hooks/queries/useWithdrawableRewards';
import useAllocationsStore from 'store/allocations/store';
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
  const { timeCurrentAllocationEnd } = useEpochAndAllocationTimestamps();
  const { data: userAllocations, isFetching: isFetchingUserAllocations } = useUserAllocations();
  const { data: withdrawableRewards, isFetching: isWithdrawableRewardsFetching } =
    useWithdrawableRewards();
  const { data: individualReward, isFetching: isFetchingIndividualReward } = useIndividualReward();
  const { rewardsForProposals } = useAllocationsStore(state => ({
    rewardsForProposals: state.data.rewardsForProposals,
    setRewardsForProposals: state.setRewardsForProposals,
  }));
  const { data: syncStatusData } = useSyncStatus();

  const isPreLaunch = getIsPreLaunch(currentEpoch);

  const pendingCrypto = individualReward?.sub(rewardsForProposals);

  const isProjectAdminMode = useIsProjectAdminMode();

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: isWithdrawableRewardsFetching,
        valueCrypto: currentEpoch === 1 ? BigNumber.from(0) : withdrawableRewards?.sum,
      },
      label: i18n.t('common.availableNow'),
    },
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
            label: t('pending'),
            tooltipProps: {
              position: 'bottom-right',
              text: (
                <div className={styles.pendingTooltip}>
                  <div className={styles.pendingTooltipLabel}>
                    {t('pendingFundsAvailableAfter')}
                  </div>
                  <div className={styles.pendingTooltipDate}>
                    {timeCurrentAllocationEnd
                      ? format(new Date(timeCurrentAllocationEnd), 'haaa z, d LLLL')
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
        isFetching: isWithdrawableRewardsFetching,
        valueCrypto: currentEpoch === 1 ? BigNumber.from(0) : withdrawableRewards?.sum,
      },
      label: i18n.t('common.availableNow'),
    },
  ];

  return (
    <Fragment>
      <BoxRounded
        alignment="left"
        buttonProps={{
          dataTest: 'BoxPersonalAllocation__Button',
          isDisabled: isPreLaunch || !isConnected,
          isHigh: true,
          label: t('withdrawToWallet'),
          onClick: () => setIsModalOpen(true),
          variant: isProjectAdminMode ? 'cta' : 'secondary',
        }}
        className={className}
        dataTest="BoxPersonalAllocation"
        hasSections
        isVertical
        title={isProjectAdminMode ? i18n.t('common.donations') : t('personalAllocation')}
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
