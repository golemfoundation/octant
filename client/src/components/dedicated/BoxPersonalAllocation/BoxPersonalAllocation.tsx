import { format } from 'date-fns-tz';
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
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useWithdrawals from 'hooks/queries/useWithdrawals';
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
  const { data: withdrawals, isFetching: isFetchingWithdrawals } = useWithdrawals();
  const { data: isPatronMode } = useIsPatronMode();
  const { isAppWaitingForTransactionToBeIndexed } = useTransactionLocalStore(state => ({
    isAppWaitingForTransactionToBeIndexed: state.data.isAppWaitingForTransactionToBeIndexed,
  }));

  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const isProjectAdminMode = useIsProjectAdminMode();

  const sections: SectionProps[] = [
    ...(!isProjectAdminMode
      ? [
          {
            doubleValueProps: {
              cryptoCurrency: 'ethereum',
              isFetching: isFetchingWithdrawals,
              valueCrypto: withdrawals?.sums.pending,
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
        coinPricesServerDowntimeText: !isProjectAdminMode ? '...' : undefined,
        cryptoCurrency: 'ethereum',
        isFetching: isFetchingWithdrawals || isAppWaitingForTransactionToBeIndexed,
        valueCrypto: withdrawals?.sums.available,
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
                  withdrawals?.sums.available?.isZero(),
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
