import { format } from 'date-fns';
import React, { FC, Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import ModalEarnWithdrawEth from 'components/Earn/ModalEarnWithdrawEth';
import BoxRounded from 'components/ui/BoxRounded';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/ui/BoxRounded/Sections/types';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useTotalPatronDonations from 'hooks/helpers/useTotalPatronDonations';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useWithdrawals from 'hooks/queries/useWithdrawals';
import useTransactionLocalStore from 'store/transactionLocal/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './EarnBoxPersonalAllocation.module.scss';
import EarnBoxPersonalAllocationProps from './types';

const EarnBoxPersonalAllocation: FC<EarnBoxPersonalAllocationProps> = ({ className }) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.boxPersonalAllocation',
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { isConnected } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { timeCurrentEpochStart, timeCurrentAllocationEnd } = useEpochAndAllocationTimestamps();
  const { data: currentEpochProps } = useCurrentEpochProps();
  const { data: withdrawals, isFetching: isFetchingWithdrawals } = useWithdrawals();
  const { data: individualReward, isFetching: isFetchingIndividualReward } = useIndividualReward();
  const { data: isPatronMode } = useIsPatronMode();
  const { data: totalPatronDonations, isFetching: isFetchingTotalPatronDonations } =
    useTotalPatronDonations({ isEnabledAdditional: !!isPatronMode });
  const { isAppWaitingForTransactionToBeIndexed } = useTransactionLocalStore(state => ({
    isAppWaitingForTransactionToBeIndexed: state.data.isAppWaitingForTransactionToBeIndexed,
  }));

  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const isProjectAdminMode = useIsProjectAdminMode();

  const sections: SectionProps[] = [
    ...(!isProjectAdminMode
      ? [
          {
            dataTest: 'BoxPersonalAllocation__Section',
            doubleValueProps: {
              cryptoCurrency: 'ethereum',
              dataTest: 'BoxPersonalAllocation__Section--pending__DoubleValue',
              isFetching: isPatronMode ? isFetchingIndividualReward : isFetchingWithdrawals,
              valueCrypto: isPatronMode ? individualReward : withdrawals?.sums.pending,
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
                        {currentEpochProps && timeCurrentEpochStart && timeCurrentAllocationEnd
                          ? format(
                              new Date(
                                isDecisionWindowOpen
                                  ? timeCurrentAllocationEnd
                                  : // When AW is closed, it's when the last AW closed.
                                    timeCurrentEpochStart + currentEpochProps.decisionWindow,
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
      dataTest: 'BoxPersonalAllocation__Section',
      doubleValueProps: {
        coinPricesServerDowntimeText: !isProjectAdminMode ? '...' : undefined,
        cryptoCurrency: 'ethereum',
        dataTest: 'BoxPersonalAllocation__Section--availableNow__DoubleValue',
        isFetching: isPatronMode ? isFetchingTotalPatronDonations : isFetchingWithdrawals,
        valueCrypto: isPatronMode ? totalPatronDonations?.value : withdrawals?.sums.available,
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
    return i18n.t('common.personalAllocation');
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
                  isFetchingWithdrawals ||
                  isAppWaitingForTransactionToBeIndexed ||
                  !!(withdrawals?.sums.available && withdrawals.sums.available === 0n),
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
      <ModalEarnWithdrawEth
        modalProps={{
          isOpen: isModalOpen,
          onClosePanel: () => setIsModalOpen(false),
        }}
      />
    </Fragment>
  );
};

export default EarnBoxPersonalAllocation;
