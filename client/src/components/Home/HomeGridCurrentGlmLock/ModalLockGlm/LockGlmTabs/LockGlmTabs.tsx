import cx from 'classnames';
import { useFormikContext } from 'formik';
import React, { FC, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { FormFields } from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm/LockGlm/types';
import LockGlmTabsInputs from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm/LockGlmTabsInputs';
import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';
import ButtonProps from 'components/ui/Button/types';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useDepositValue from 'hooks/queries/useDepositValue';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import getFormattedGlmValue from 'utils/getFormattedGlmValue';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import styles from './LockGlmTabs.module.scss';
import LockGlmTabsProps from './types';

const LockGlmTabs: FC<LockGlmTabsProps> = ({
  buttonUseMaxRef,
  className,
  currentMode,
  isLoading,
  onClose,
  onInputsFocusChange,
  onReset,
  setFieldValue,
  setValueToDepose,
  showBalances,
  step,
}) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.glmLock',
  });
  const formik = useFormikContext<FormFields>();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: availableFundsGlm } = useAvailableFundsGlm();
  const { data: depositsValue } = useDepositValue();

  const isMaxDisabled = isLoading || step > 1;

  const onSetValue = (value: string): void => {
    formik.setFieldValue('valueToDeposeOrWithdraw', value);
    setValueToDepose(value ? parseUnitsBigInt(value) : BigInt(0));
  };

  const onMax = () => {
    if (isMaxDisabled || depositsValue === undefined || !availableFundsGlm) {
      return;
    }
    const value =
      currentMode === 'lock'
        ? formatUnitsBigInt(BigInt(availableFundsGlm.value))
        : formatUnitsBigInt(depositsValue);

    onSetValue(value);
    inputRef.current?.focus();
  };

  const buttonCtaProps: ButtonProps =
    step === 3
      ? {
          onClick: onClose,
          type: 'button',
        }
      : {
          type: 'submit',
        };

  const buttonLabel = useMemo(() => {
    if (isLoading) {
      return i18n.t('common.waitingForConfirmation');
    }
    if (step === 3) {
      return i18n.t('common.close');
    }
    if (currentMode === 'unlock') {
      return t('unlock');
    }
    return t('lock');
  }, [currentMode, step, t, isLoading, i18n]);

  const isButtonDisabled =
    !formik.isValid || parseUnitsBigInt(formik.values.valueToDeposeOrWithdraw || '0') === 0n;

  return (
    <BoxRounded
      className={cx(styles.box, className)}
      dataTest="LockGlmTabs"
      isGrey
      tabs={[
        {
          isActive: currentMode === 'lock',
          isDisabled: isLoading,
          onClick: () => onReset({ newMode: 'lock', setFieldValue }),
          title: t('lock'),
        },
        {
          isActive: currentMode === 'unlock',
          isDisabled: isLoading,
          onClick: () => onReset({ newMode: 'unlock', setFieldValue }),
          title: t('unlock'),
        },
      ]}
    >
      <Button
        ref={buttonUseMaxRef}
        className={cx(styles.max, isMaxDisabled && styles.isDisabled)}
        onClick={onMax}
        variant="iconOnlyTransparent2"
      >
        {t('glmLockTabs.useMax')}
      </Button>
      <LockGlmTabsInputs
        ref={inputRef}
        areInputsDisabled={isLoading}
        cryptoCurrency="golem"
        error={formik.values.valueToDeposeOrWithdraw && formik.errors.valueToDeposeOrWithdraw}
        inputCryptoProps={{
          name: 'valueToDeposeOrWithdraw',
          onClear: formik.resetForm,
          suffix: 'GLM',
          value: formik.values.valueToDeposeOrWithdraw,
        }}
        label={
          <div className={styles.inputsLabel}>
            {t(currentMode === 'lock' ? 'glmLockTabs.amountToLock' : 'glmLockTabs.amountToUnlock')}
            {showBalances && (
              <div className={styles.inputsLabelBalance}>
                <div
                  className={cx(
                    styles.lockedValue,
                    formik.errors.valueToDeposeOrWithdraw === 'cantUnlock' && styles.cantUnlock,
                  )}
                >
                  {getFormattedGlmValue({ value: depositsValue || BigInt(0) }).value}
                </div>
                {t('glmLockTabs.locked')}
                <div
                  className={cx(
                    styles.availableValue,
                    formik.errors.valueToDeposeOrWithdraw === 'dontHaveEnough' &&
                      styles.dontHaveEnough,
                  )}
                >
                  {
                    getFormattedGlmValue({
                      value: BigInt(availableFundsGlm ? availableFundsGlm?.value : 0),
                    }).value
                  }
                </div>
                {i18n.t('common.available')}
              </div>
            )}
          </div>
        }
        mode={currentMode}
        onChange={onSetValue}
        onInputsFocusChange={onInputsFocusChange}
      />
      <Button
        className={styles.button}
        dataTest="GlmLockTabs__Button"
        isDisabled={isButtonDisabled}
        isHigh
        isLoading={isLoading}
        label={buttonLabel}
        variant="cta"
        {...buttonCtaProps}
      />
    </BoxRounded>
  );
};

export default LockGlmTabs;
