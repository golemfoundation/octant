import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import TimeCounter from 'components/dedicated/TimeCounter/TimeCounter';
import { BatchWithdrawRequest } from 'hooks/contracts/typings/Vault';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useWithdrawEth from 'hooks/mutations/useWithdrawEth';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useWithdrawableRewards from 'hooks/queries/useWithdrawableRewards';
import useWithdrawableUserEth from 'hooks/queries/useWithdrawableUserEth';
import triggerToast from 'utils/triggerToast';

import styles from './WithdrawEth.module.scss';

const WithdrawEth: FC = () => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.withdrawEth',
  });
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: withdrawableUserEth } = useWithdrawableUserEth();
  const { data: withdrawableRewards, isFetched: isWithdrawableRewardsFetched } =
    useWithdrawableRewards();
  const { data: isDecisionWindowOpen, refetch: refetchIsDecisionWindowOpen } =
    useIsDecisionWindowOpen();
  const { data: currentEpochProps } = useCurrentEpochProps();
  const { timeCurrentAllocationEnd } = useEpochAndAllocationTimestamps();
  const withdrawEthMutation = useWithdrawEth({
    onSuccess: () => {
      triggerToast({
        title: i18n.t('common.transactionSuccessful'),
      });
    },
  });

  const withdrawEth = () => {
    if (!withdrawableRewards?.length) {
      return;
    }
    const value: BatchWithdrawRequest[] = withdrawableRewards.map(({ amount, epoch, proof }) => ({
      amount: BigInt(amount),
      epoch: BigInt(epoch.toString()),
      proof,
    }));
    withdrawEthMutation.mutateAsync(value);
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
        <DoubleValue cryptoCurrency="ethereum" valueCrypto={withdrawableUserEth} />
      </BoxRounded>
      <Button
        className={cx(styles.element, styles.button)}
        isDisabled={!isWithdrawableRewardsFetched}
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
