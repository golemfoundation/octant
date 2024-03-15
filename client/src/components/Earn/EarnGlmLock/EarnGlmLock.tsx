import { Formik } from 'formik';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useWalletClient, usePublicClient, useWaitForTransaction } from 'wagmi';

import EarnGlmLockBudget from 'components/Earn/EarnGlmLock/EarnGlmLockBudget';
import EarnGlmLockNotification from 'components/Earn/EarnGlmLock/EarnGlmLockNotification';
import EarnGlmLockStepper from 'components/Earn/EarnGlmLock/EarnGlmLockStepper';
import EarnGlmLockTabs from 'components/Earn/EarnGlmLock/EarnGlmLockTabs';
import env from 'env';
import { writeContractERC20 } from 'hooks/contracts/writeContracts';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useApprovalState, { ApprovalState } from 'hooks/helpers/useMaxApproveCallback';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useLock from 'hooks/mutations/useLock';
import useUnlock from 'hooks/mutations/useUnlock';
import useDepositValue from 'hooks/queries/useDepositValue';
import useProjectsContract from 'hooks/queries/useProjectsContract';
import toastService from 'services/toastService';
import useTransactionLocalStore from 'store/transactionLocal/store';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import styles from './EarnGlmLock.module.scss';
import EarnGlmLockProps, { Step, OnReset } from './types';
import { formInitialValues, validationSchema } from './utils';

const EarnGlmLock: FC<EarnGlmLockProps> = ({ currentMode, onCurrentModeChange, onCloseModal }) => {
  const { i18n } = useTranslation();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { isDesktop } = useMediaQuery();
  const [transactionHashForEtherscan, setTransactionHashForEtherscan] = useState<
    string | undefined
  >(undefined);
  const { addTransactionPending } = useTransactionLocalStore(state => ({
    addTransactionPending: state.addTransactionPending,
  }));
  const { data: transactionReceipt, isLoading: isLoadingTransactionReceipt } =
    useWaitForTransaction({
      hash: transactionHashForEtherscan as `0x${string}` | undefined,
      onReplaced: response =>
        setTransactionHashForEtherscan(response.transactionReceipt.transactionHash),
    });

  /**
   * Value to depose so that we don't ask for allowance when user
   * requests less than already approved.
   */
  const [valueToDepose, setValueToDepose] = useState<bigint>(BigInt(0));
  const [step, setStep] = useState<Step>(1);
  const [isCryptoOrFiatInputFocused, setIsCryptoOrFiatInputFocused] = useState<boolean>(true);
  const buttonUseMaxRef = useRef<HTMLButtonElement>(null);

  const { data: availableFundsGlm } = useAvailableFundsGlm();
  const { data: projectsAddresses } = useProjectsContract();
  const { data: depositsValue } = useDepositValue();

  useEffect(() => {
    if (transactionReceipt && !isLoadingTransactionReceipt) {
      setStep(3);
    }
  }, [transactionReceipt, isLoadingTransactionReceipt, setStep]);

  const [approvalState, approveCallback] = useApprovalState(
    address,
    env.contractDepositsAddress,
    valueToDepose,
  );

  const isButtonUseMaxFocused = document.activeElement === buttonUseMaxRef.current;
  /**
   * When input is focused isCryptoOrFiatInputFocused is true.
   * Clicking "use max" blurs inputs, setting isCryptoOrFiatInputFocused to false.
   * EarnGlmLockTabs onMax sets the focus back on inputs, triggering isCryptoOrFiatInputFocused to true.
   *
   * Between second and third update flickering can occur, when focus is already set to input,
   * but state didn't update yet.
   *
   * To check it out set isAnyInputFocused to permanent "false" and click "use max" fast.
   */
  const isAnyInputFocused = document.activeElement?.tagName === 'INPUT';
  const showBudgetBox =
    isDesktop ||
    (!isDesktop && !isCryptoOrFiatInputFocused && !isButtonUseMaxFocused && !isAnyInputFocused);

  const onMutate = async (): Promise<void> => {
    if (!walletClient || !availableFundsGlm) {
      return;
    }

    setStep(2);

    const approvalStateCurrent = await approveCallback();
    if (currentMode === 'lock' && approvalStateCurrent !== ApprovalState.APPROVED) {
      const hash = await writeContractERC20({
        args: [env.contractDepositsAddress, availableFundsGlm.value],
        functionName: 'approve',
        walletClient,
      });
      await publicClient.waitForTransactionReceipt({ hash });
    }
  };

  const onSuccess = async ({ hash, value }): Promise<void> => {
    addTransactionPending({
      amount: value,
      // GET /history uses microseconds. Normalization here.
      timestamp: (Date.now() * 1000).toString(),
      transactionHash: hash,
      type: currentMode,
    });
    setTransactionHashForEtherscan(hash);
  };

  const onReset: OnReset = ({ setFieldValue, newMode = 'lock' }) => {
    onCurrentModeChange(newMode);
    setTransactionHashForEtherscan(undefined);
    setStep(1);

    if (setFieldValue) {
      setFieldValue('currentMode', newMode);
    }
  };

  const onError = () => onReset({ newMode: currentMode });

  const lockMutation = useLock({ onError, onMutate, onSuccess });
  const unlockMutation = useUnlock({ onError, onMutate, onSuccess });

  const onApproveOrDeposit = async ({ valueToDeposeOrWithdraw }): Promise<void> => {
    const isSignedInAsAProject = projectsAddresses!.includes(address!);

    if (isSignedInAsAProject) {
      toastService.showToast({
        name: 'projectForbiddenOperation',
        title: i18n.t('common.projectForbiddenOperation'),
        type: 'error',
      });
      return;
    }

    const valueToDeposeOrWithdrawBigInt = parseUnitsBigInt(valueToDeposeOrWithdraw);
    if (currentMode === 'lock') {
      await lockMutation.mutateAsync(valueToDeposeOrWithdrawBigInt);
    } else {
      await unlockMutation.mutateAsync(valueToDeposeOrWithdrawBigInt);
    }
  };

  const isLockingApproved = approvalState === ApprovalState.APPROVED;
  const isApprovalKnown = approvalState !== ApprovalState.UNKNOWN;

  return (
    <Formik
      initialValues={formInitialValues}
      isInitialValid={false}
      onSubmit={onApproveOrDeposit}
      validateOnChange
      validationSchema={validationSchema(
        BigInt(availableFundsGlm ? availableFundsGlm?.value : 0),
        depositsValue,
      )}
    >
      {props => (
        <form className={styles.form} onSubmit={props.handleSubmit}>
          {isDesktop && (
            <EarnGlmLockStepper className={styles.element} currentMode={currentMode} step={step} />
          )}
          {(step === 2 && currentMode === 'lock' && isApprovalKnown && !isLockingApproved) ||
          step === 3 ? (
            <EarnGlmLockNotification
              className={styles.element}
              currentMode={currentMode}
              isLockingApproved={isLockingApproved}
              transactionHash={transactionHashForEtherscan}
              type={step === 3 ? 'success' : 'info'}
            />
          ) : (
            <EarnGlmLockBudget isVisible={showBudgetBox} />
          )}
          <EarnGlmLockTabs
            buttonUseMaxRef={buttonUseMaxRef}
            className={styles.element}
            currentMode={currentMode}
            isLoading={isLoadingTransactionReceipt || props.isSubmitting}
            onClose={onCloseModal}
            onInputsFocusChange={setIsCryptoOrFiatInputFocused}
            onReset={onReset}
            setFieldValue={props.setFieldValue}
            setValueToDepose={setValueToDepose}
            showBalances={!showBudgetBox}
            step={step}
          />
        </form>
      )}
    </Formik>
  );
};

export default EarnGlmLock;
