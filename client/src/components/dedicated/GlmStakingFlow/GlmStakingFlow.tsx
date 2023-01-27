import cx from 'classnames';
import { BigNumber, ContractTransaction } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import React, { FC, useEffect, useState } from 'react';
import { useMetamask } from 'use-metamask';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import InputText from 'components/core/InputText/InputText';
import Loader from 'components/core/Loader/Loader';
import Modal from 'components/core/Modal/Modal';
import ProgressStepper from 'components/core/ProgressStepper/ProgressStepper';
import BudgetBox from 'components/dedicated/BudgetBox/BudgetBox';
import { DEPOSIT_WITHDRAW_GAS_LIMIT } from 'constants/contracts';
import env from 'env';
import useContractDeposits from 'hooks/contracts/useContractDeposits';
import useAvailableFunds from 'hooks/useAvailableFunds';
import useDepositEffectiveAtCurrentEpoch from 'hooks/useDepositEffectiveAtCurrentEpoch';
import useDepositValue from 'hooks/useDepositValue';
import useMaxApproveCallback from 'hooks/useMaxApproveCallback';
import { floatNumberWithUpTo18DecimalPlaces } from 'utils/regExp';
import triggerToast from 'utils/triggerToast';

import styles from './style.module.scss';
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
  const [isApproveOrDepositInProgress, setIsApproveOrDepositInProgress] = useState<boolean>(false);
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
  const contractDeposits = useContractDeposits({ signerOrProvider: signer });
  const [approvalState, approveCallback] = useMaxApproveCallback(
    BigNumber.from(parseUnits(valueToDeposeOrWithdraw || '1', 18)),
    depositsAddress,
    signer,
    address,
  );

  const onReset = (newMode: CurrentMode = 'deposit') => {
    setCurrentMode(newMode);
    setValueToDeposeOrWithdraw('');
    setCurrentStepIndex(0);
    setTransactionHash('');
    setIsApproveOrDepositInProgress(false);
  };

  const onRefetch = async () => {
    await refetchDeposit();
    await refetchAvailableFunds();
    await refetchDepositEffectiveAtCurrentEpoch();
  };

  useEffect(() => {
    onReset();
  }, [modalProps.isOpen]);

  const onChangeValue = (newValue: string): void => {
    if (newValue && !floatNumberWithUpTo18DecimalPlaces.test(newValue)) {
      return;
    }

    const depositValueNumber = parseInt(formatUnits(depositsValue!), 10);
    const newValueNumber = parseInt(newValue, 10);

    if (currentMode === 'withdraw' && newValueNumber > depositValueNumber) {
      setValueToDeposeOrWithdraw(depositValueNumber.toString());
      toastDebouncedUnstakeValueTooBig();
      return;
    }
    if (currentMode === 'deposit' && newValueNumber > dataAvailableFunds!) {
      setValueToDeposeOrWithdraw(dataAvailableFunds!.toString());
      toastDebouncedStakeValueTooBig();
      return;
    }

    setValueToDeposeOrWithdraw(newValue);
  };

  const onDeposit = async (value: BigNumber): Promise<ContractTransaction | undefined> =>
    contractDeposits?.deposit(value, { gasLimit: DEPOSIT_WITHDRAW_GAS_LIMIT });

  const onWithdraw = async (value: BigNumber): Promise<ContractTransaction | undefined> =>
    contractDeposits?.withdraw(value, { gasLimit: DEPOSIT_WITHDRAW_GAS_LIMIT });

  const onApproveOrDeposit = async () => {
    if (!signer || !valueToDeposeOrWithdraw) {
      return;
    }

    setIsApproveOrDepositInProgress(true);
    if (currentMode === 'deposit' && approvalState === 'NOT_APPROVED') {
      await approveCallback();
    }

    setCurrentStepIndex(1);

    const valueToDeposeOrWithdrawBigNumber = parseUnits(valueToDeposeOrWithdraw.toString(), 18);

    let transactionResponse;
    if (currentMode === 'deposit') {
      transactionResponse = await onDeposit(valueToDeposeOrWithdrawBigNumber);
    } else {
      transactionResponse = await onWithdraw(valueToDeposeOrWithdrawBigNumber);
    }
    await transactionResponse.wait(1);
    setTransactionHash(transactionResponse!.hash);
    triggerToast({
      title: 'Transaction successful',
    });
    await onRefetch();
    setValueToDeposeOrWithdraw('');
    setCurrentStepIndex(3);
    setIsApproveOrDepositInProgress(false);
  };

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
          Available wallet balance {dataAvailableFunds} GLM.
        </div>
      </BoxRounded>
      <Button
        className={cx(styles.element, styles.button)}
        Icon={isApproveOrDepositInProgress && <Loader />}
        isDisabled={!valueToDeposeOrWithdraw || isApproveOrDepositInProgress}
        isHigh
        label={getButtonCtaLabel(currentMode, currentStepIndex)}
        onClick={onApproveOrDeposit}
        variant="cta"
      />
    </Modal>
  );
};

export default GlmStakingFlow;
