import cx from 'classnames';
import { BigNumber, ContractTransaction } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useFormik } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useSigner } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import ProgressStepper from 'components/core/ProgressStepper/ProgressStepper';
import BudgetBox from 'components/dedicated/BudgetBox/BudgetBox';
import InputsCryptoFiat from 'components/dedicated/InputsCryptoFiat/InputsCryptoFiat';
import env from 'env';
import useMaxApproveCallback from 'hooks/helpers/useMaxApproveCallback';
import useLock from 'hooks/mutations/useLock';
import useUnlock from 'hooks/mutations/useUnlock';
import useAvailableFundsGlm from 'hooks/queries/useAvailableFundsGlm';
import useDepositEffectiveAtCurrentEpoch from 'hooks/queries/useDepositEffectiveAtCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useLocks from 'hooks/subgraph/useLocks';
import useUnlocks from 'hooks/subgraph/useUnlocks';
import triggerToast from 'utils/triggerToast';

import styles from './GlmLock.module.scss';
import GlmLockProps, { CurrentMode, CurrentStepIndex, FormValues } from './types';
import { formInitialValues, getButtonCtaLabel, validationSchema } from './utils';

const currentStepIndexInitialValue = 0;

const budgetBoxVariants = {
  hide: {
    height: '0',
    margin: '0',
    opacity: '0',
    zIndex: '-1',
  },
  show: {
    height: '0',
    margin: '0',
    opacity: '0',
    zIndex: '-1',
  },
  visible: {
    height: 'auto',
    margin: '0 auto 1.6rem',
    opacity: 1,
    zIndex: '1',
  },
};

const GlmLock: FC<GlmLockProps> = ({
  showBudgetBox,
  currentMode,
  onCurrentModeChange,
  onChangeCryptoOrFiatInputFocus,
}) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.glmLock',
  });
  const { depositsAddress } = env.contracts;
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<CurrentStepIndex>(
    currentStepIndexInitialValue,
  );
  const { refetch: refetchDepositEffectiveAtCurrentEpoch } = useDepositEffectiveAtCurrentEpoch();
  const { data: dataAvailableFunds, refetch: refetchAvailableFunds } = useAvailableFundsGlm();
  const { data: depositsValue, refetch: refetchDeposit } = useDepositValue();
  const { data: proposalsAddresses } = useProposalsContract();
  const { refetch: refetchDeposits } = useLocks();
  const { refetch: refetchWithdrawns } = useUnlocks();
  const [approvalState, approveCallback] = useMaxApproveCallback(
    BigNumber.from(dataAvailableFunds || BigNumber.from(1)),
    depositsAddress,
    signer,
    address,
  );

  const onRefetch = async (): Promise<void> => {
    await refetchDeposit();
    await refetchAvailableFunds();
    await refetchDepositEffectiveAtCurrentEpoch();
    await refetchDeposits();
    await refetchWithdrawns();
  };

  const onMutate = async (): Promise<void> => {
    if (!signer) {
      return;
    }

    if (currentMode === 'lock' && approvalState === 'NOT_APPROVED') {
      await approveCallback();
    }

    setCurrentStepIndex(1);
  };

  const onSuccess = async (transactionResponse: ContractTransaction): Promise<void> => {
    setTransactionHash(transactionResponse!.hash);
    triggerToast({
      title: i18n.t('common.transactionSuccessful'),
    });
    await onRefetch();
    setCurrentStepIndex(3);
  };

  const lockMutation = useLock({ onMutate, onSuccess });
  const unlockMutation = useUnlock({ onMutate, onSuccess });

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

  const formik = useFormik<FormValues>({
    initialValues: formInitialValues,
    onSubmit: onApproveOrDeposit,
    validateOnChange: true,
    validationSchema: validationSchema(currentMode, dataAvailableFunds, depositsValue),
  });

  const onReset = (newMode: CurrentMode = 'lock'): void => {
    onCurrentModeChange(newMode);
    setCurrentStepIndex(0);
    setTransactionHash('');
    formik.resetForm();
  };

  return (
    <form className={styles.form} onSubmit={formik.handleSubmit}>
      <BoxRounded className={styles.element} isGrey>
        <ProgressStepper
          currentStepIndex={currentStepIndex}
          steps={
            currentMode === 'lock'
              ? [t('submit'), t('approveAndLock'), t('done')]
              : [t('submit'), t('withdraw'), t('done')]
          }
        />
      </BoxRounded>
      <AnimatePresence initial={false}>
        {showBudgetBox && (
          <motion.div
            animate="visible"
            className={styles.budgetBoxContainer}
            exit="hide"
            initial="show"
            transition={{ ease: 'linear' }}
            variants={budgetBoxVariants}
          >
            <BudgetBox
              currentStepIndex={currentStepIndex}
              depositsValue={depositsValue}
              isError={!formik.isValid}
              transactionHash={transactionHash}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <BoxRounded
        className={styles.element}
        isGrey
        tabs={[
          {
            isActive: currentMode === 'lock',
            onClick: () => onReset('lock'),
            title: t('lock'),
          },
          {
            isActive: currentMode === 'unlock',
            onClick: () => onReset('unlock'),
            title: t('unlock'),
          },
        ]}
      >
        <InputsCryptoFiat
          cryptoCurrency="golem"
          error={formik.errors.valueToDeposeOrWithdraw}
          inputCryptoProps={{
            isDisabled: formik.isSubmitting,
            name: 'valueToDeposeOrWithdraw',
            onChange: value => {
              formik.setFieldValue('valueToDeposeOrWithdraw', value);
            },
            onClear: formik.resetForm,
            suffix: 'GLM',
            value: formik.values.valueToDeposeOrWithdraw,
          }}
          label={currentMode === 'lock' ? t('amountToLock') : t('amountToUnlock')}
          onInputsFocusChange={onChangeCryptoOrFiatInputFocus}
        />
      </BoxRounded>
      <Button
        className={cx(styles.element, styles.button)}
        isDisabled={!formik.isValid}
        isHigh
        isLoading={formik.isSubmitting}
        label={getButtonCtaLabel(currentMode, currentStepIndex, formik.isSubmitting)}
        type="submit"
        variant="cta"
      />
    </form>
  );
};

export default GlmLock;
