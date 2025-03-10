import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useGasPrice } from 'wagmi';

import BoxRounded from 'components/ui/BoxRounded';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/ui/BoxRounded/Sections/types';
import Button from 'components/ui/Button';
import useWithdrawEth, { BatchWithdrawRequest } from 'hooks/mutations/useWithdrawEth';
import useWithdrawals from 'hooks/queries/useWithdrawals';
import useTransactionLocalStore from 'store/transactionLocal/store';

import WithdrawEthProps from './types';
import styles from './WithdrawEth.module.scss';

const WithdrawEth: FC<WithdrawEthProps> = ({ onCloseModal }) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridPersonalAllocation.modalWithdrawEth',
  });
  const { data: gasPrice, isFetching: isFetchingGasPrice } = useGasPrice();
  const { isAppWaitingForTransactionToBeIndexed, addTransactionPending } = useTransactionLocalStore(
    state => ({
      addTransactionPending: state.addTransactionPending,
      isAppWaitingForTransactionToBeIndexed: state.data.isAppWaitingForTransactionToBeIndexed,
    }),
  );
  const { data: withdrawals, isFetching: isWithdrawableRewardsFetching } = useWithdrawals();
  const withdrawEthMutation = useWithdrawEth();

  const withdrawEth = async () => {
    if (!withdrawals?.withdrawalsAvailable.length) {
      return;
    }
    const value: BatchWithdrawRequest[] = withdrawals.withdrawalsAvailable.map(
      ({ amount, epoch, proof }) => ({
        amount: BigInt(amount),
        epoch: BigInt(epoch.toString()),
        proof,
      }),
    );
    const { hash } = await withdrawEthMutation.mutateAsync(value);
    addTransactionPending({
      eventData: {
        amount: withdrawals.sums.available,
        transactionHash: hash,
      },
      // GET /history uses seconds. Normalization here.
      timestamp: Math.floor(Date.now() / 1000).toString(),
      type: 'withdrawal',
    });
    onCloseModal();
  };

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        dataTest: 'WithdrawEth__Section--amount',
        isFetching: isWithdrawableRewardsFetching || isAppWaitingForTransactionToBeIndexed,
        showCryptoSuffix: true,
        valueCrypto: withdrawals?.sums.available,
      },
      label: i18n.t('common.amount'),
    },
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        dataTest: 'WithdrawEth__Section--estGasPrice',
        isFetching: isFetchingGasPrice,
        showCryptoSuffix: true,
        valueCrypto: BigInt(gasPrice ?? 0),
      },
      label: t('estimatedGasPrice'),
    },
  ];

  return (
    <div className={styles.root} data-test="WithdrawEth">
      <BoxRounded hasSections isGrey isVertical>
        <Sections hasBottomDivider sections={sections} />
        <Button
          className={styles.button}
          dataTest="WithdrawEth__Button"
          isDisabled={
            isWithdrawableRewardsFetching ||
            isAppWaitingForTransactionToBeIndexed ||
            !!(withdrawals?.sums.available === 0n)
          }
          isHigh
          isLoading={withdrawEthMutation.isPending}
          label={
            withdrawEthMutation.isPending
              ? i18n.t('common.waitingForConfirmation')
              : t('withdrawAll')
          }
          onClick={withdrawEth}
          variant="cta"
        />
      </BoxRounded>
    </div>
  );
};

export default WithdrawEth;
