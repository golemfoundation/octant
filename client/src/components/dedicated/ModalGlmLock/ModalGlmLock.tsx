import cx from 'classnames';
import { BigNumber, ContractTransaction } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useFormik } from 'formik';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useSigner } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import Modal from 'components/core/Modal/Modal';
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
import useLocks from 'hooks/subgraph/useLocks';
import useUnlocks from 'hooks/subgraph/useUnlocks';
import { comma, floatNumberWithUpTo18DecimalPlaces } from 'utils/regExp';
import triggerToast from 'utils/triggerToast';

import styles from './ModalGlmLock.module.scss';
import ModalGlmLockProps, { CurrentMode, CurrentStepIndex, FormValues } from './types';
import { formInitialValues, getButtonCtaLabel, validationSchema } from './utils';

const currentStepIndexInitialValue = 0;

const ModalGlmLock: FC<ModalGlmLockProps> = ({ modalProps }) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.modalGlmLock',
  });
  const { depositsAddress } = env.contracts;
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [currentMode, setCurrentMode] = useState<CurrentMode>('lock');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<CurrentStepIndex>(
    currentStepIndexInitialValue,
  );
  const { refetch: refetchDepositEffectiveAtCurrentEpoch } = useDepositEffectiveAtCurrentEpoch();
  const { data: dataAvailableFunds, refetch: refetchAvailableFunds } = useAvailableFundsGlm();
  const { data: depositsValue, refetch: refetchDeposit } = useDepositValue();
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
    setCurrentMode(newMode);
    setCurrentStepIndex(0);
    setTransactionHash('');
    formik.resetForm();
  };

  useEffect(() => {
    onReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalProps.isOpen]);

  return (
    <Modal
      header={currentMode === 'lock' ? i18n.t('common.lockGlm') : t('unlockGLM')}
      {...modalProps}
    >
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
        <BudgetBox
          className={styles.element}
          currentStepIndex={currentStepIndex}
          depositsValue={depositsValue}
          isError={!formik.isValid}
          transactionHash={transactionHash}
        />
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
            error={formik.errors.valueToDeposeOrWithdraw}
            inputCryptoProps={{
              isDisabled: formik.isSubmitting,
              name: 'valueToDeposeOrWithdraw',
              onChange: event => {
                /* eslint-disable no-param-reassign */
                event.target.value = event.target.value.replace(comma, '.');

                const {
                  target: { value },
                } = event;

                if (value && !floatNumberWithUpTo18DecimalPlaces.test(value)) {
                  return;
                }

                formik.handleChange(event);
              },
              onClear: formik.resetForm,
              suffix: 'GLM',
              value: formik.values.valueToDeposeOrWithdraw,
            }}
            label={currentMode === 'lock' ? t('amountToLock') : t('amountToUnlock')}
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
    </Modal>
  );
};

export default ModalGlmLock;
