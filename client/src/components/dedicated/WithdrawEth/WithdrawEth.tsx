import cx from 'classnames';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import TimeCounter from 'components/dedicated/TimeCounter/TimeCounter';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useWithdrawEth, { BatchWithdrawRequest } from 'hooks/mutations/useWithdrawEth';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useWithdrawableRewards from 'hooks/queries/useWithdrawableRewards';
import useMetaStore from 'store/meta/store';
import triggerToast from 'utils/triggerToast';

import styles from './WithdrawEth.module.scss';

const WithdrawEth = (): ReactElement => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.withdrawEth',
  });

  const { addTransactionPending } = useMetaStore(state => ({
    addTransactionPending: state.addTransactionPending,
  }));
  const { data: currentEpoch } = useCurrentEpoch();
  const {
    data: withdrawableRewards,
    isFetching: isWithdrawableRewardsFetching,
    refetch: refetchWithdrawableRewards,
  } = useWithdrawableRewards();
  const { data: isDecisionWindowOpen, refetch: refetchIsDecisionWindowOpen } =
    useIsDecisionWindowOpen();
  const { data: currentEpochProps } = useCurrentEpochProps();
  const { timeCurrentAllocationEnd } = useEpochAndAllocationTimestamps();
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
  };

  return (
    <div className={styles.root}>
      {isDecisionWindowOpen && (
        <BoxRounded className={styles.element} isGrey isVertical>
          {t('withdrawalsDistributedEpoch', {
            currentEpoch,
          })}
          <TimeCounter
            className={styles.timeCounter}
            duration={currentEpochProps?.decisionWindow}
            onCountingFinish={refetchIsDecisionWindowOpen}
            timestamp={timeCurrentAllocationEnd}
            variant="small"
          />
        </BoxRounded>
      )}
      <BoxRounded
        alignment="left"
        className={styles.element}
        isGrey
        isVertical
        title={t('rewardsBudget')}
      >
        <DoubleValue
          cryptoCurrency="ethereum"
          isFetching={isWithdrawableRewardsFetching}
          valueCrypto={withdrawableRewards?.sum}
        />
      </BoxRounded>
      <Button
        className={cx(styles.element, styles.button)}
        isDisabled={!isWithdrawableRewardsFetching}
        isHigh
        isLoading={withdrawEthMutation.isLoading}
        label={t('requestWithdrawal')}
        onClick={withdrawEth}
        variant="cta"
      />
    </div>
  );
};

export default WithdrawEth;
