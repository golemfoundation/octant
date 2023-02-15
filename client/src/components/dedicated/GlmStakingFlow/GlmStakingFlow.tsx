import cx from 'classnames';
import { BigNumber, ContractTransaction } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import React, { FC, useEffect, useState } from 'react';
import { useMetamask } from 'use-metamask';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import InputText from 'components/core/InputText/InputText';
import Modal from 'components/core/Modal/Modal';
import ProgressStepper from 'components/core/ProgressStepper/ProgressStepper';
import BudgetBox from 'components/dedicated/BudgetBox/BudgetBox';
import env from 'env';
import useDeposit from 'hooks/mutations/useDeposit';
import useWithdraw from 'hooks/mutations/useWithdraw';
import useAvailableFunds from 'hooks/queries/useAvailableFunds';
import useDepositEffectiveAtCurrentEpoch from 'hooks/queries/useDepositEffectiveAtCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useDeposits from 'hooks/subgraph/useDeposits';
import useWithdrawns from 'hooks/subgraph/useWithdrawns';
import useMaxApproveCallback from 'hooks/useMaxApproveCallback';
import { floatNumberWithUpTo18DecimalPlaces } from 'utils/regExp';
import triggerToast from 'utils/triggerToast';

import styles from './GlmStakingFlow.module.scss';
import GlmStakingFlowProps, { CurrentMode, CurrentStepIndex } from './types';
import {
  getButtonCtaLabel,
  toastDebouncedStakeValueTooBig,
  toastDebouncedUnstakeValueTooBig,
} from './utils';

const currentStepIndexInitialValue = 0;

const GlmStakingFlow: FC<GlmStakingFlowProps> = ({ modalProps }) => {
  const { depositsAddress } = env.contracts;
  const {
    metaState: { account, web3: useMetamaskWeb3 },
  } = useMetamask();
  const address = account[0];
  const signer = useMetamaskWeb3?.getSigner();
  const [currentMode, setCurrentMode] = useState<CurrentMode>('deposit');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [valueToDeposeOrWithdraw, setValueToDeposeOrWithdraw] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<CurrentStepIndex>(
    currentStepIndexInitialValue,
  );
  const { refetch: refetchDepositEffectiveAtCurrentEpoch } = useDepositEffectiveAtCurrentEpoch();
  const { data: dataAvailableFunds, refetch: refetchAvailableFunds } = useAvailableFunds(
    address,
    signer,
  );
  const { data: depositsValue, refetch: refetchDeposit } = useDepositValue();
  const { refetch: refetchDeposits } = useDeposits();
  const { refetch: refetchWithdrawns } = useWithdrawns();
  const [approvalState, approveCallback] = useMaxApproveCallback(
    BigNumber.from(parseUnits(valueToDeposeOrWithdraw || '1', 18)),
    depositsAddress,
    signer,
    address,
  );

  const onReset = (newMode: CurrentMode = 'deposit'): void => {
    setCurrentMode(newMode);
    setValueToDeposeOrWithdraw('');
    setCurrentStepIndex(0);
    setTransactionHash('');
  };

  const onRefetch = async (): Promise<void> => {
    await refetchDeposit();
    await refetchAvailableFunds();
    await refetchDepositEffectiveAtCurrentEpoch();
    await refetchDeposits();
    await refetchWithdrawns();
  };

  useEffect(() => {
    onReset();
  }, [modalProps.isOpen]);

  const onMutate = async (): Promise<void> => {
    if (!signer || !valueToDeposeOrWithdraw) {
      return;
    }

    if (currentMode === 'deposit' && approvalState === 'NOT_APPROVED') {
      await approveCallback();
    }

    setCurrentStepIndex(1);
  };

  const onSuccess = async (transactionResponse: ContractTransaction): Promise<void> => {
    setTransactionHash(transactionResponse!.hash);
    triggerToast({
      title: 'Transaction successful',
    });
    await onRefetch();
    setValueToDeposeOrWithdraw('');
    setCurrentStepIndex(3);
  };

  const depositMutation = useDeposit({ onMutate, onSuccess });
  const withdrawMutation = useWithdraw({ onMutate, onSuccess });

  const onApproveOrDeposit = async (): Promise<void> => {
    const valueToDeposeOrWithdrawBigNumber = parseUnits(valueToDeposeOrWithdraw.toString(), 18);
    if (currentMode === 'deposit') {
      await depositMutation.mutateAsync(valueToDeposeOrWithdrawBigNumber);
    } else {
      await withdrawMutation.mutateAsync(valueToDeposeOrWithdrawBigNumber);
    }
  };

  const onChangeValue = (newValue: string): void => {
    if (newValue && !floatNumberWithUpTo18DecimalPlaces.test(newValue)) {
      return;
    }

    const newValueBigNumber = parseUnits(newValue || '0');
    let valueToSet = newValue;
    if (currentMode === 'withdraw' && newValueBigNumber.gt(depositsValue!)) {
      valueToSet = formatUnits(depositsValue!);
      toastDebouncedUnstakeValueTooBig();
    }
    if (currentMode === 'deposit' && newValueBigNumber.gt(dataAvailableFunds!)) {
      valueToSet = formatUnits(dataAvailableFunds!);
      toastDebouncedStakeValueTooBig();
    }

    setValueToDeposeOrWithdraw(valueToSet);
  };

  const isApproveOrDepositInProgress = depositMutation.isLoading || withdrawMutation.isLoading;

  return (
    <Modal header={currentMode === 'deposit' ? 'Stake GLM' : 'Unstake GLM'} {...modalProps}>
      <BoxRounded className={styles.element} isGrey>
        <ProgressStepper
          currentStepIndex={currentStepIndex}
          steps={
            currentMode === 'deposit'
              ? ['Submit', 'Approve & Stake', 'Done']
              : ['Submit', 'Withdraw', 'Done']
          }
        />
      </BoxRounded>
      <BudgetBox
        className={styles.element}
        currentStepIndex={currentStepIndex}
        depositsValue={depositsValue}
        transactionHash={transactionHash}
      />
      <BoxRounded
        isGrey
        tabs={[
          {
            isActive: currentMode === 'deposit',
            onClick: () => onReset('deposit'),
            title: 'Stake',
          },
          {
            isActive: currentMode === 'withdraw',
            onClick: () => onReset('withdraw'),
            title: 'Unstake',
          },
        ]}
      >
        <div className={styles.inputs}>
          <InputText
            className={styles.input}
            isDisabled={isApproveOrDepositInProgress}
            label={currentMode === 'deposit' ? 'Amount to stake' : 'Amount to unstake'}
            onChange={({ target: { value } }) => onChangeValue(value)}
            suffix="GLM"
            value={valueToDeposeOrWithdraw}
            variant="simple"
          />
          <InputText className={styles.input} isDisabled suffix="USD" variant="simple" />
        </div>
        <div className={styles.availableFunds}>
          Available wallet balance {dataAvailableFunds ? formatUnits(dataAvailableFunds) : '0.0'}{' '}
          GLM.
        </div>
      </BoxRounded>
      <Button
        className={cx(styles.element, styles.button)}
        isDisabled={!valueToDeposeOrWithdraw}
        isHigh
        isLoading={isApproveOrDepositInProgress}
        label={getButtonCtaLabel(currentMode, currentStepIndex, isApproveOrDepositInProgress)}
        onClick={onApproveOrDeposit}
        variant="cta"
      />
    </Modal>
  );
};

export default GlmStakingFlow;
