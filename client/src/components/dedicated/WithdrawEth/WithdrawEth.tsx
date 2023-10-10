import { BigNumber } from 'ethers';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useFeeData } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import Button from 'components/core/Button/Button';
import useWithdrawEth, { BatchWithdrawRequest } from 'hooks/mutations/useWithdrawEth';
import useWithdrawableRewards from 'hooks/queries/useWithdrawableRewards';
import useMetaStore from 'store/meta/store';
import triggerToast from 'utils/triggerToast';

import WithdrawEthProps from './types';
import styles from './WithdrawEth.module.scss';

const WithdrawEth: FC<WithdrawEthProps> = ({ onCloseModal }) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.withdrawEth',
  });
  const { data: feeData, isFetching: isFetchingFeeData } = useFeeData();
  const { addTransactionPending } = useMetaStore(state => ({
    addTransactionPending: state.addTransactionPending,
  }));
  const {
    data: withdrawableRewards,
    isFetching: isWithdrawableRewardsFetching,
    refetch: refetchWithdrawableRewards,
  } = useWithdrawableRewards();
  const withdrawEthMutation = useWithdrawEth({
    onSuccess: () => {
      triggerToast({
        title: i18n.t('common.transactionSuccessful'),
      });
      refetchWithdrawableRewards();
    },
  });

  const withdrawEth = async () => {
    if (!withdrawableRewards?.array.length) {
      return;
    }
    const value: BatchWithdrawRequest[] = withdrawableRewards.array.map(
      ({ amount, epoch, proof }) => ({
        amount: BigInt(amount),
        epoch: BigInt(epoch.toString()),
        proof,
      }),
    );
    const { hash } = await withdrawEthMutation.mutateAsync(value);
    addTransactionPending({
      amount: withdrawableRewards!.sum,
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
        isFetching: isWithdrawableRewardsFetching,
        valueCrypto: withdrawableRewards?.sum,
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
          isDisabled={!isWithdrawableRewardsFetching || withdrawableRewards?.sum.isZero()}
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

export default WithdrawEth;
