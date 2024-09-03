import { Formik } from 'formik';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useWalletClient, usePublicClient, useWaitForTransactionReceipt } from 'wagmi';

import { apiGetSafeTransactions } from 'api/calls/safeTransactions';
import LockGlmBudget from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm/LockGlmBudget';
import LockGlmNotification from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm/LockGlmNotification';
import LockGlmStepper from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm/LockGlmStepper';
import LockGlmTabs from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm/LockGlmTabs';
import networkConfig from 'constants/networkConfig';
import env from 'env';
import { writeContractERC20 } from 'hooks/contracts/writeContracts';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useApprovalState, { ApprovalState } from 'hooks/helpers/useMaxApproveCallback';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useLock from 'hooks/mutations/useLock';
import useUnlock from 'hooks/mutations/useUnlock';
import useDepositValue from 'hooks/queries/useDepositValue';
import useEstimatedEffectiveDeposit from 'hooks/queries/useEstimatedEffectiveDeposit';
import useHistory from 'hooks/queries/useHistory';
import useIsContract from 'hooks/queries/useIsContract';
import useProjectsEpoch from 'hooks/queries/useProjectsEpoch';
import useLockedSummaryLatest from 'hooks/subgraph/useLockedSummaryLatest';
import toastService from 'services/toastService';
import useTransactionLocalStore from 'store/transactionLocal/store';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import styles from './LockGlm.module.scss';
import LockGlmProps, { Step, OnReset } from './types';
import { formInitialValues, validationSchema } from './utils';

const LockGlm: FC<LockGlmProps> = ({ currentMode, onCurrentModeChange, onCloseModal }) => {
  const { i18n } = useTranslation();
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: networkConfig.id });
  const { data: walletClient } = useWalletClient();
  const { isDesktop } = useMediaQuery();
  const { data: isContract } = useIsContract();
  const [transactionHashForEtherscan, setTransactionHashForEtherscan] = useState<
    string | undefined
  >(undefined);
  const { addTransactionPending } = useTransactionLocalStore(state => ({
    addTransactionPending: state.addTransactionPending,
  }));
  const { data: transactionReceipt, isLoading: isLoadingTransactionReceipt } =
    useWaitForTransactionReceipt({
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
  const [intervalId, setIntervalId] = useState<null | NodeJS.Timeout>(null);
  const [isCryptoOrFiatInputFocused, setIsCryptoOrFiatInputFocused] = useState<boolean>(true);
  const buttonUseMaxRef = useRef<HTMLButtonElement>(null);

  const { data: availableFundsGlm } = useAvailableFundsGlm();
  const { data: projectsEpoch } = useProjectsEpoch();
  const { refetch: refetchHistory } = useHistory();
  const { data: depositsValue, refetch: refetchDeposit } = useDepositValue();
  const { refetch: refetchEstimatedEffectiveDeposit } = useEstimatedEffectiveDeposit();
  const { refetch: refetchLockedSummaryLatest } = useLockedSummaryLatest();

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
   * LockGlmTabs onMax sets the focus back on inputs, triggering isCryptoOrFiatInputFocused to true.
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
    if (!publicClient || !walletClient || !availableFundsGlm) {
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
    if (isContract) {
      const id = setInterval(async () => {
        const nextSafeTransactions = await apiGetSafeTransactions(address!);
        const safeTransaction = nextSafeTransactions.results.find(
          t => t.safeTxHash === hash && t.transactionHash,
        );

        if (safeTransaction) {
          clearInterval(id);
          Promise.all([
            refetchDeposit(),
            refetchEstimatedEffectiveDeposit(),
            refetchLockedSummaryLatest(),
            refetchHistory(),
          ]).then(() => {
            setTransactionHashForEtherscan(safeTransaction.transactionHash);
            setStep(3);
          });
        }
      }, 2000);
      setIntervalId(id);
      return;
    }
    addTransactionPending({
      eventData: {
        amount: value,
        transactionHash: hash,
      },
      isMultisig: !!isContract,
      // GET /history uses seconds. Normalization here.
      timestamp: Math.floor(Date.now() / 1000).toString(),
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
    const isSignedInAsAProject = projectsEpoch!.projectsAddresses.includes(address!);

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

  useEffect(() => {
    return () => {
      if (!intervalId) {
        return;
      }
      clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <Formik
      initialValues={formInitialValues(currentMode)}
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
            <LockGlmStepper className={styles.element} currentMode={currentMode} step={step} />
          )}
          {(step === 2 && currentMode === 'lock' && isApprovalKnown && !isLockingApproved) ||
          step === 3 ? (
            <LockGlmNotification
              className={styles.element}
              currentMode={currentMode}
              isLockingApproved={isLockingApproved}
              transactionHash={transactionHashForEtherscan}
              type={step === 3 ? 'success' : 'info'}
            />
          ) : (
            <LockGlmBudget isVisible={showBudgetBox} />
          )}
          <LockGlmTabs
            buttonUseMaxRef={buttonUseMaxRef}
            className={styles.element}
            currentMode={currentMode}
            isLoading={
              isLoadingTransactionReceipt || props.isSubmitting || (!!isContract && step === 2)
            }
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

export default LockGlm;
