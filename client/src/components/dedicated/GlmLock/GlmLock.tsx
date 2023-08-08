import { MaxUint256 } from '@ethersproject/constants';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { Formik } from 'formik';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useWalletClient, usePublicClient, useWaitForTransaction } from 'wagmi';

import GlmLockBudget from 'components/dedicated/GlmLock/GlmLockBudget/GlmLockBudget';
import GlmLockNotification from 'components/dedicated/GlmLock/GlmLockNotification/GlmLockNotification';
import GlmLockStepper from 'components/dedicated/GlmLock/GlmLockStepper/GlmLockStepper';
import GlmLockTabs from 'components/dedicated/GlmLock/GlmLockTabs/GlmLockTabs';
import env from 'env';
import { writeContractERC20 } from 'hooks/contracts/writeContracts';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useApprovalState, { ApprovalState } from 'hooks/helpers/useMaxApproveCallback';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useLock from 'hooks/mutations/useLock';
import useUnlock from 'hooks/mutations/useUnlock';
import useDepositValue from 'hooks/queries/useDepositValue';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useMetaStore from 'store/meta/store';
import triggerToast from 'utils/triggerToast';

import styles from './GlmLock.module.scss';
import GlmLockProps, { CurrentMode, Step } from './types';
import { formInitialValues, validationSchema } from './utils';

const GlmLock: FC<GlmLockProps> = ({ currentMode, onCurrentModeChange, onCloseModal }) => {
  const { i18n } = useTranslation();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { isDesktop } = useMediaQuery();
  const [transactionHashForEtherscan, setTransactionHashForEtherscan] = useState<
    string | undefined
  >(undefined);
  const { setTransactionHashesToWaitFor, transactionHashesToWaitFor } = useMetaStore(state => ({
    setTransactionHashesToWaitFor: state.setTransactionHashesToWaitFor,
    transactionHashesToWaitFor: state.data.transactionHashesToWaitFor,
  }));
  const { data: transactionReceipt, isLoading: isLoadingTransactionReceipt } =
    useWaitForTransaction({
      hash: transactionHashesToWaitFor
        ? (transactionHashesToWaitFor[0] as `0x${string}`)
        : undefined,
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
        args: [env.contractDepositsAddress, MaxUint256.toString()],
        functionName: 'approve',
        walletClient,
      });
      await publicClient.waitForTransactionReceipt({ hash });
    }
  };

  const onSuccess = async (transactionHashResponse: string): Promise<void> => {
    /**
     * setTransactionHashesToWaitFor goes to App.tsx when app waits for tx to resolve and fetch
     * block from subgraph and is set to null there on success.
     *
     * setTransactionHashForEtherscan is here for the link
     */
    setTransactionHashesToWaitFor([transactionHashResponse]);
    setTransactionHashForEtherscan(transactionHashResponse);
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
      return triggerToast({
        title: i18n.t('common.proposalForbiddenOperation'),
        type: 'error',
      });
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
            <GlmLockStepper className={styles.element} currentMode={currentMode} step={step} />
          )}
          {(step === 2 && currentMode === 'lock' && isApprovalKnown && !isLockingApproved) ||
          step === 3 ? (
            <GlmLockNotification
              className={styles.element}
              currentMode={currentMode}
              isLockingApproved={isLockingApproved}
              transactionHash={transactionHashForEtherscan}
              type={step === 3 ? 'success' : 'info'}
            />
          ) : (
            <GlmLockBudget isVisible={showBudgetBox} />
          )}
          <GlmLockTabs
            className={styles.element}
            currentMode={currentMode}
            isLoading={
              (!!transactionHashesToWaitFor && transactionHashesToWaitFor.length > 0) ||
              props.isSubmitting
            }
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

export default GlmLock;
