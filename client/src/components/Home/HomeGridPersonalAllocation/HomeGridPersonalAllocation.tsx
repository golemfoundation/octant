import { format } from 'date-fns';
import _first from 'lodash/first';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import ModalWithdrawEth from 'components/Home/HomeGridPersonalAllocation/ModalWithdrawEth';
import GridTile from 'components/shared/Grid/GridTile';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import Button from 'components/ui/Button';
import DoubleValue from 'components/ui/DoubleValue';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useTotalPatronDonations from 'hooks/helpers/useTotalPatronDonations';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useWithdrawals from 'hooks/queries/useWithdrawals';
import useTransactionLocalStore from 'store/transactionLocal/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './HomeGridPersonalAllocation.module.scss';
import HomeGridPersonalAllocationProps from './types';

const HomeGridPersonalAllocation: FC<HomeGridPersonalAllocationProps> = ({ className }) => {
  const { isConnected } = useAccount();
  const { isMobile } = useMediaQuery();
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridPersonalAllocation',
  });
  const [isModalWithdrawEthOpen, setIsModalWithdrawEthOpen] = useState<boolean>(false);
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { timeCurrentEpochStart, timeCurrentAllocationEnd } = useEpochAndAllocationTimestamps();
  const { data: currentEpochProps } = useCurrentEpochProps();
  const { data: withdrawals, isFetching: isFetchingWithdrawals } = useWithdrawals();
  const { data: individualReward, isFetching: isFetchingIndividualReward } = useIndividualReward();
  const { data: isPatronMode } = useIsPatronMode();
  const { data: totalPatronDonations, isFetching: isFetchingTotalPatronDonations } =
    useTotalPatronDonations({ isEnabledAdditional: !!isPatronMode });
  const { isAppWaitingForTransactionToBeIndexed, transactionsPending } = useTransactionLocalStore(
    state => ({
      isAppWaitingForTransactionToBeIndexed: state.data.isAppWaitingForTransactionToBeIndexed,
      transactionsPending: state.data.transactionsPending,
    }),
  );

  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const isProjectAdminMode = useIsProjectAdminMode();

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
    <>
      <GridTile className={className} title={title}>
        <div className={styles.root}>
          <DoubleValue
            cryptoCurrency="golem"
            isFetching={
              (isPatronMode ? isFetchingTotalPatronDonations : isFetchingWithdrawals) ||
              (isAppWaitingForTransactionToBeIndexed &&
                _first(transactionsPending)?.type === 'withdrawal')
            }
            showCryptoSuffix
            valueCrypto={isPatronMode ? totalPatronDonations?.value : withdrawals?.sums.available}
            variant={isMobile ? 'large' : 'extra-large'}
          />
          {!isProjectAdminMode && (
            <>
              <div className={styles.divider} />
              <Sections
                hasBottomDivider
                sections={[
                  {
                    dataTest: 'BoxPersonalAllocation__Section',
                    doubleValueProps: {
                      cryptoCurrency: 'ethereum',
                      dataTest: 'BoxPersonalAllocation__Section--pending__DoubleValue',
                      isFetching:
                        (isPatronMode ? isFetchingIndividualReward : isFetchingWithdrawals) ||
                        (isAppWaitingForTransactionToBeIndexed &&
                          _first(transactionsPending)?.type === 'withdrawal'),
                      showCryptoSuffix: true,
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
                                {currentEpochProps &&
                                timeCurrentEpochStart &&
                                timeCurrentAllocationEnd
                                  ? format(
                                      new Date(
                                        isDecisionWindowOpen
                                          ? timeCurrentAllocationEnd
                                          : // When AW is closed, it's when the last AW closed.
                                            timeCurrentEpochStart +
                                            currentEpochProps.decisionWindow,
                                      ),
                                      'haaa z, d LLLL',
                                    )
                                  : ''}
                              </div>
                            </div>
                          ),
                        },
                  },
                ]}
                variant="standard"
              />
            </>
          )}
          {!isPatronMode && !isProjectAdminMode && (
            <Button
              className={styles.withdrawEthButton}
              isDisabled={
                isPreLaunch ||
                !isConnected ||
                isFetchingWithdrawals ||
                isAppWaitingForTransactionToBeIndexed ||
                !!(withdrawals?.sums.available && withdrawals.sums.available === 0n)
              }
              isHigh
              onClick={() => setIsModalWithdrawEthOpen(true)}
              variant={isProjectAdminMode ? 'cta' : 'secondary'}
            >
              {t('withdrawToWallet')}
            </Button>
          )}
        </div>
      </GridTile>
      <ModalWithdrawEth
        modalProps={{
          dataTest: 'ModalWithdrawEth',
          isOpen: isModalWithdrawEthOpen,
          onClosePanel: () => setIsModalWithdrawEthOpen(false),
        }}
      />
    </>
  );
};

export default HomeGridPersonalAllocation;
