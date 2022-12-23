import { BigNumber, ContractTransaction } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useMetamask } from 'use-metamask';
import React, { FC, useEffect, useState } from 'react';
import cx from 'classnames';

import { DEPOSIT_WITHDRAW_GAS_LIMIT } from 'constants/contracts';
import { floatNumberWithUpTo18DecimalPlaces } from 'utils/regExp';
import BoxRounded from 'components/core/box-rounded/box-rounded.component';
import BudgetBox from 'components/dedicated/budget-box/budget-box.component';
import Button from 'components/core/button/button.component';
import InputText from 'components/core/input-text/input-text.component';
import Loader from 'components/core/loader/loader.component';
import Modal from 'components/core/modal/modal.component';
import ProgressStepper from 'components/core/progress-stepper/progress-stepper.component';
import env from 'env';
import triggerToast from 'utils/triggerToast';
import useAvailableFunds from 'hooks/useAvailableFunds';
import useContractDeposits from 'hooks/contracts/useContractDeposits';
import useDepositValue from 'hooks/useDepositValue';
import useMaxApproveCallback from 'hooks/useMaxApproveCallback';

import { toastDebouncedStakeValueTooBig, toastDebouncedUnstakeValueTooBig } from './utils';
import GlmStakingFlowProps, { CurrentMode, CurrentStepIndex } from './types';
import styles from './style.module.scss';

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
    await refetchDeposit();
    await refetchAvailableFunds();
    setValueToDeposeOrWithdraw('');
    setCurrentStepIndex(3);
    setIsApproveOrDepositInProgress(false);
  };

  return (
    <Modal {...modalProps}>
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
            label="Amount to stake"
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
        label={currentMode === 'deposit' ? 'Stake' : 'Unstake'}
        onClick={onApproveOrDeposit}
        variant="cta"
      />
    </Modal>
  );
};

export default GlmStakingFlow;
