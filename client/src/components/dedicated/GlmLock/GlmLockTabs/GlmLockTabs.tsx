import cx from 'classnames';
import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useFormikContext } from 'formik';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import ButtonProps from 'components/core/Button/types';
import { FormFields } from 'components/dedicated/GlmLock/types';
import InputsCryptoFiat from 'components/dedicated/InputsCryptoFiat/InputsCryptoFiat';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useDepositValue from 'hooks/queries/useDepositValue';
import getFormattedGlmValue from 'utils/getFormattedGlmValue';

import styles from './GlmLockTabs.module.scss';
import GlmLockTabsProps from './types';

const GlmLockTabs: FC<GlmLockTabsProps> = ({
  className,
  currentMode,
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

  const isMaxDisabled = formik.isSubmitting || step > 1;

  const onSetValue = (value: string): void => {
    formik.setFieldValue('valueToDeposeOrWithdraw', value);
    setValueToDepose(value ? parseUnits(value) : BigNumber.from(0));
  };

  const onMax = () => {
    if (isMaxDisabled || !depositsValue || !availableFundsGlm) {
      return;
    }
    const value =
      currentMode === 'lock'
        ? formatUnits(BigNumber.from(availableFundsGlm.value))
        : formatUnits(depositsValue);

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
    if (formik.isSubmitting) {
      return t('glmLockTabs.waitingForConformation');
    }
    if (step === 3) {
      return i18n.t('common.close');
    }
    if (currentMode === 'unlock') {
      return t('unlock');
    }
    return t('lock');
  }, [currentMode, step, t, formik.isSubmitting, i18n]);

  const isButtonDisabled =
    !formik.isValid || parseUnits(formik.values.valueToDeposeOrWithdraw || '0').isZero();

  return (
    <BoxRounded
      className={cx(styles.box, className)}
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
      <div className={cx(styles.max, isMaxDisabled && styles.isDisabled)} onClick={onMax}>
        {t('glmLockTabs.useMax')}
      </div>
      <InputsCryptoFiat
        areInputsDisabled={formik.isSubmitting}
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
                  {getFormattedGlmValue(depositsValue || BigNumber.from(0)).value}
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
                    getFormattedGlmValue(
                      BigNumber.from(availableFundsGlm ? availableFundsGlm?.value : 0),
                    ).value
                  }
                </div>
                {t('glmLockTabs.available')}
              </div>
            )}
          </div>
        }
        onInputsFocusChange={onInputsFocusChange}
      />
      <Button
        className={styles.button}
        isDisabled={isButtonDisabled}
        isHigh
        isLoading={formik.isSubmitting}
        label={buttonLabel}
        variant="cta"
        {...buttonCtaProps}
      />
    </BoxRounded>
  );
};

export default GlmLockTabs;
