import { format } from 'date-fns';
import _first from 'lodash/first';
import React, { FC, useState } from 'react';
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
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
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
  const { isAppWaitingForTransactionToBeIndexed, transactionsPending } = useTransactionLocalStore(
    state => ({
      isAppWaitingForTransactionToBeIndexed: state.data.isAppWaitingForTransactionToBeIndexed,
      transactionsPending: state.data.transactionsPending,
    }),
  );

  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const isProjectAdminMode = useIsProjectAdminMode();

  return (
    <>
      <GridTile
        className={className}
        dataTest="HomeGridPersonalAllocation"
        title={isProjectAdminMode ? t('yourFunds') : i18n.t('common.personalAllocation')}
      >
        <div className={styles.root}>
          <DoubleValue
            cryptoCurrency="ethereum"
            dataTest="HomeGridPersonalAllocation__DoubleValue--current"
            isFetching={
              isFetchingWithdrawals ||
              (isAppWaitingForTransactionToBeIndexed &&
                _first(transactionsPending)?.type === 'withdrawal')
            }
            showCryptoSuffix
            valueCrypto={withdrawals?.sums.available}
            variant={isMobile ? 'large' : 'extra-large'}
          />

          <div className={styles.divider} />
          <Sections
            hasBottomDivider
            sections={[
              {
                className: styles.pending,
                dataTest: 'HomeGridPersonalAllocation__Section--pending',
                doubleValueProps: {
                  cryptoCurrency: 'ethereum',
                  dataTest: 'HomeGridPersonalAllocation--pending',
                  isFetching:
                    isFetchingWithdrawals ||
                    (isAppWaitingForTransactionToBeIndexed &&
                      _first(transactionsPending)?.type === 'withdrawal'),
                  showCryptoSuffix: true,
                  valueCrypto: withdrawals?.sums.pending,
                },
                label: i18n.t('common.pending'),
                tooltipProps: {
                  dataTest: 'HomeGridPersonalAllocation--pending__Tooltip',
                  position: 'bottom-right',
                  text: (
                    <div>
                      <div>{t('pendingFundsAvailableAfter')}</div>
                      <div>
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
              },
            ]}
            variant="standard"
          />
          <Button
            className={styles.button}
            dataTest="HomeGridPersonalAllocation__Button"
            isDisabled={
              isPreLaunch ||
              !isConnected ||
              isFetchingWithdrawals ||
              isAppWaitingForTransactionToBeIndexed ||
              withdrawals?.sums.available === 0n
            }
            isHigh
            onClick={() => setIsModalWithdrawEthOpen(true)}
            variant={isProjectAdminMode ? 'cta' : 'secondary'}
          >
            {t('withdrawToWallet')}
          </Button>
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
