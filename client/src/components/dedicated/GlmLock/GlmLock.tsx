import { MaxUint256 } from '@ethersproject/constants';
import { TransactionReceipt } from 'ethereum-abi-types-generator';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { Formik } from 'formik';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import GlmLockBudget from 'components/dedicated/GlmLock/GlmLockBudget/GlmLockBudget';
import GlmLockNotification from 'components/dedicated/GlmLock/GlmLockNotification/GlmLockNotification';
import GlmLockStepper from 'components/dedicated/GlmLock/GlmLockStepper/GlmLockStepper';
import GlmLockTabs from 'components/dedicated/GlmLock/GlmLockTabs/GlmLockTabs';
import env from 'env';
import useContractErc20 from 'hooks/contracts/useContractErc20';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
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
  const { isDesktop } = useMediaQuery();
  const { setBlockNumberWithLatestTx } = useMetaStore(state => ({
    setBlockNumberWithLatestTx: state.setBlockNumberWithLatestTx,
  }));

  const { data: availableFundsGlm } = useAvailableFundsGlm();
  const { data: proposalsAddresses } = useProposalsContract();
  const { data: depositsValue, refetch: refetchDeposit } = useDepositValue();
  const contract = useContractErc20();

  const [step, setStep] = useState<Step>(1);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [isCryptoOrFiatInputFocused, setIsCryptoOrFiatInputFocused] = useState(false);
  const showBudgetBox = isDesktop || (!isDesktop && !isCryptoOrFiatInputFocused);

  const onRefetch = async (blockNumber: number): Promise<void> => {
    // History and effective deposits are refetched in App.tsx. Look for a comment there.
    setBlockNumberWithLatestTx(blockNumber);
    await refetchDeposit();
  };

  const onMutate = async (): Promise<void> => {
    if (!contract || !address || !availableFundsGlm) {
      return;
    }

    const allowance = await contract.methods.allowance(address, env.contractDepositsAddress).call();
    const allowanceBigNumber = BigNumber.from(allowance);

    const isApproved = allowanceBigNumber.gte(availableFundsGlm?.value);

    if (currentMode === 'lock' && !isApproved) {
      await contract.methods
        .approve(env.contractDepositsAddress, MaxUint256.toString())
        .send({ from: address })
        .catch((error: Error) => {
          // eslint-disable-next-line no-console
          console.warn(`Failed to approve max amount for token ${contract.address}`, error);
          throw error;
        });
    }

    setStep(2);
  };

  const onSuccess = async (transactionResponse: TransactionReceipt): Promise<void> => {
    await onRefetch(transactionResponse.blockNumber);
    setTransactionHash(transactionResponse!.transactionHash);
    setStep(3);
  };

  const onReset = (newMode: CurrentMode = 'lock'): void => {
    onCurrentModeChange(newMode);
    setTransactionHash('');
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
          {/* TODO: OCT-737 https://linear.app/golemfoundation/issue/OCT-737/unlocking-glm-info-notification  */}
          {(step === 2 && currentMode !== 'unlock') || step === 3 ? (
            <GlmLockNotification
              className={styles.element}
              currentMode={currentMode}
              transactionHash={transactionHash}
              type={step === 2 ? 'info' : 'success'}
            />
          ) : (
            <GlmLockBudget isVisible={showBudgetBox} />
          )}
          <GlmLockTabs
            className={styles.element}
            currentMode={currentMode}
            onClose={onCloseModal}
            onInputsFocusChange={setIsCryptoOrFiatInputFocused}
            onReset={onReset}
            showBalances={!showBudgetBox}
            step={step}
          />
        </form>
      )}
    </Formik>
  );
};

export default GlmLock;
