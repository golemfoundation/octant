import cx from 'classnames';
import { useFormikContext } from 'formik';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import EarnGlmLockTabsInputs from 'components/Earn/EarnGlmLock/EarnGlmLockTabsInputs';
import { FormFields } from 'components/Earn/EarnGlmLock/types';
import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';
import ButtonProps from 'components/ui/Button/types';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useDepositValue from 'hooks/queries/useDepositValue';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import getFormattedGlmValue from 'utils/getFormattedGlmValue';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import styles from './EarnGlmLockTabs.module.scss';
import EarnGlmLockTabsProps from './types';

const EarnGlmLockTabs: FC<EarnGlmLockTabsProps> = ({
  className,
  currentMode,
  isLoading,
  step,
  onClose,
  onInputsFocusChange,
  setValueToDepose,
  onReset,
  showBalances,
}) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.glmLock',
  });
  const formik = useFormikContext<FormFields>();

  const { data: availableFundsGlm } = useAvailableFundsGlm();
  const { data: depositsValue } = useDepositValue();

  const isMaxDisabled = isLoading || step > 1;

  const onSetValue = (value: string): void => {
    formik.setFieldValue('valueToDeposeOrWithdraw', value);
    setValueToDepose(value ? parseUnitsBigInt(value) : BigInt(0));
  };

  const onMax = () => {
    if (isMaxDisabled || !depositsValue || !availableFundsGlm) {
      return;
    }
    const value =
      currentMode === 'lock'
        ? formatUnitsBigInt(BigInt(availableFundsGlm.value))
        : formatUnitsBigInt(depositsValue);

    onSetValue(value);
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
      isGrey
      tabs={[
        {
          isActive: currentMode === 'lock',
          isDisabled: isLoading,
          onClick: () => onReset('lock'),
          title: t('lock'),
        },
        {
          isActive: currentMode === 'unlock',
          isDisabled: isLoading,
          onClick: () => onReset('unlock'),
          title: t('unlock'),
        },
      ]}
    >
      <div className={cx(styles.max, isMaxDisabled && styles.isDisabled)} onClick={onMax}>
        {t('glmLockTabs.useMax')}
      </div>
      <EarnGlmLockTabsInputs
        areInputsDisabled={isLoading}
        cryptoCurrency="golem"
        error={formik.values.valueToDeposeOrWithdraw && formik.errors.valueToDeposeOrWithdraw}
        inputCryptoProps={{
          name: 'valueToDeposeOrWithdraw',
          onChange: onSetValue,
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
                  {getFormattedGlmValue(depositsValue || BigInt(0)).value}
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
                    getFormattedGlmValue(BigInt(availableFundsGlm ? availableFundsGlm?.value : 0))
                      .value
                  }
                </div>
                {i18n.t('common.available')}
              </div>
            )}
          </div>
        }
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

export default EarnGlmLockTabs;
