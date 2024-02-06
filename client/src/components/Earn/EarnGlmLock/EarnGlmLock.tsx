import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { Formik } from 'formik';
import React, { FC, useEffect, useState } from 'react';
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
import useProposalsContract from 'hooks/queries/useProposalsContract';
import toastService from 'services/toastService';
import useTransactionLocalStore from 'store/transactionLocal/store';

import styles from './EarnGlmLock.module.scss';
import EarnGlmLockProps, { CurrentMode, Step } from './types';
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
  const [valueToDepose, setValueToDepose] = useState<BigNumber>(BigNumber.from(0));
  const [step, setStep] = useState<Step>(1);
  const [isCryptoOrFiatInputFocused, setIsCryptoOrFiatInputFocused] = useState(false);

  const { data: availableFundsGlm } = useAvailableFundsGlm();
  const { data: proposalsAddresses } = useProposalsContract();
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
  const showBudgetBox = isDesktop || (!isDesktop && !isCryptoOrFiatInputFocused);

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

  const onReset = (newMode: CurrentMode = 'lock'): void => {
    onCurrentModeChange(newMode);
    setTransactionHashForEtherscan(undefined);
    setStep(1);
  };

  const onError = () => {
    onReset(currentMode);
  };

  const lockMutation = useLock({ onError, onMutate, onSuccess });
  const unlockMutation = useUnlock({ onError, onMutate, onSuccess });

  const onApproveOrDeposit = async ({ valueToDeposeOrWithdraw }): Promise<void> => {
    const isSignedInAsAProposal = proposalsAddresses!.includes(address!);

    if (isSignedInAsAProposal) {
      toastService.showToast({
        name: 'proposalForbiddenOperation',
        title: i18n.t('common.proposalForbiddenOperation'),
        type: 'error',
      });
      return;
    }

    const valueToDeposeOrWithdrawBigNumber = parseUnits(valueToDeposeOrWithdraw, 18);
    if (currentMode === 'lock') {
      await lockMutation.mutateAsync(valueToDeposeOrWithdrawBigNumber);
    } else {
      await unlockMutation.mutateAsync(valueToDeposeOrWithdrawBigNumber);
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
        currentMode,
        BigNumber.from(availableFundsGlm ? availableFundsGlm?.value : 0),
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
            className={styles.element}
            currentMode={currentMode}
            isLoading={isLoadingTransactionReceipt || props.isSubmitting}
            onClose={onCloseModal}
            onInputsFocusChange={setIsCryptoOrFiatInputFocused}
            onReset={onReset}
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
