import { BigNumber } from 'ethers';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useFeeData } from 'wagmi';

import BoxRounded from 'components/ui/BoxRounded';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/ui/BoxRounded/Sections/types';
import Button from 'components/ui/Button';
import useWithdrawEth, { BatchWithdrawRequest } from 'hooks/mutations/useWithdrawEth';
import useWithdrawals from 'hooks/queries/useWithdrawals';
import useTransactionLocalStore from 'store/transactionLocal/store';

import styles from './EarnWithdrawEth.module.scss';
import EarnWithdrawEthProps from './types';

const EarnWithdrawEth: FC<EarnWithdrawEthProps> = ({ onCloseModal }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.withdrawEth',
  });
  const { data: feeData, isFetching: isFetchingFeeData } = useFeeData();
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
      amount: withdrawals.sums.available,
      // GET /history uses microseconds. Normalization here.
      timestamp: (Date.now() * 1000).toString(),
      transactionHash: hash,
      type: 'withdrawal',
    });
    onCloseModal();
  };

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: isWithdrawableRewardsFetching || isAppWaitingForTransactionToBeIndexed,
        valueCrypto: withdrawals?.sums.available,
      },
      label: t('amount'),
    },
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: isFetchingFeeData,
        valueCrypto: BigNumber.from(feeData === undefined ? 0 : feeData.gasPrice),
      },
      label: t('estimatedGasPrice'),
    },
  ];

  return (
    <div className={styles.root}>
      <BoxRounded className={styles.element} hasSections isGrey isVertical>
        <Sections hasBottomDivider sections={sections} />
        <Button
          className={styles.button}
          isDisabled={
            isWithdrawableRewardsFetching ||
            isAppWaitingForTransactionToBeIndexed ||
            withdrawals?.sums.available.isZero()
          }
          isHigh
          isLoading={withdrawEthMutation.isLoading}
          label={withdrawEthMutation.isLoading ? t('waitingForConfirmation') : t('withdrawAll')}
          onClick={withdrawEth}
          variant="cta"
        />
      </BoxRounded>
    </div>
  );
};

export default EarnWithdrawEth;
