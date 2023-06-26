import cx from 'classnames';
import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useFormik } from 'formik';
import isEmpty from 'lodash/isEmpty';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/core/Button/Button';
import InputText from 'components/core/InputText/InputText';
import AllocationInputsRewardsAvailable from 'components/dedicated/AllocationInputsRewardsAvailable/AllocationInputsRewardsAvailable';
import { comma, floatNumberWithUpTo18DecimalPlaces, percentageOnly } from 'utils/regExp';

import styles from './AllocationInputs.module.scss';
import AllocationInputsProps, { FormFields, InputFocused } from './types';
import { formInitialValues, validationSchema } from './utils';

const AllocationInputs: FC<AllocationInputsProps> = ({
  className,
  isLimitVisible,
  onClose,
  onCloseAndSave,
  onValueChange,
  valueCryptoSelected,
  valueCryptoTotal,
  restToDistribute = valueCryptoTotal,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'common',
  });
  const [inputFocused, setInputFocused] = useState<InputFocused>(null);
  const [percentage, setPercentage] = useState<string>('');

  const formik = useFormik<FormFields>({
    initialValues: formInitialValues(valueCryptoSelected),
    onSubmit: () => {},
    validateOnChange: true,
    validationSchema: validationSchema(valueCryptoTotal, restToDistribute),
  });

  const valueCryptoSelectedHexString = valueCryptoSelected.toHexString();
  const valueCryptoTotalHexString = valueCryptoTotal.toHexString();
  useEffect(() => {
    setPercentage(
      valueCryptoTotal.isZero()
        ? '0'
        : valueCryptoSelected.mul(100).div(valueCryptoTotal).toString(),
    );
    formik.setFieldValue('valueCryptoSelected', formatUnits(valueCryptoSelected));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueCryptoSelectedHexString, valueCryptoTotalHexString]);

  const formikUpdateValues = (
    newValueBigNumber: BigNumber,
    newValueString: string,
    newValuePercentage: string,
  ) => {
    setPercentage(newValuePercentage);
    formik.setFieldValue('valueCryptoSelected', newValueString);

    formik.validateForm().then(errors => {
      if (isEmpty(errors)) {
        onValueChange(newValueBigNumber);
      }
    });
  };

  const onValuePercentageChange = (newValuePercentage: string) => {
    if (newValuePercentage && !percentageOnly.test(newValuePercentage)) {
      return;
    }

    const newValueBigNumber = newValuePercentage
      ? valueCryptoTotal.mul(newValuePercentage).div(100)
      : BigNumber.from(0);
    formikUpdateValues(newValueBigNumber, formatUnits(newValueBigNumber), newValuePercentage);
  };

  const onValueStringChange = (newValueString: string): void => {
    const valueComma = newValueString.replace(comma, '.');
    if (valueComma && !floatNumberWithUpTo18DecimalPlaces.test(valueComma)) {
      return;
    }

    const newValueBigNumber = parseUnits(newValueString || '0');
    let newPercentage = newValueString
      ? newValueBigNumber.mul(100).div(valueCryptoTotal).toString()
      : '0';
    newPercentage = parseInt(newPercentage, 10) > 100 ? '100' : newPercentage;
    formikUpdateValues(newValueBigNumber, newValueString, newPercentage);
  };

  const isThereSomethingToDistribute = !restToDistribute.isZero();

  return (
    <div className={cx(styles.root, className)}>
      {isLimitVisible && (
        <AllocationInputsRewardsAvailable
          className={styles.element}
          inputFocused={inputFocused}
          isThereSomethingToDistribute={isThereSomethingToDistribute}
          isValueExceeded={!!formik.errors.valueCryptoSelected}
          restToDistribute={restToDistribute}
          valueCryptoTotal={valueCryptoTotal}
        />
      )}
      <InputText
        className={styles.element}
        isButtonClearVisible={false}
        isDisabled={!isThereSomethingToDistribute}
        onBlur={() => setInputFocused(null)}
        onChange={({ target: { value: newValuePercentage } }) =>
          onValuePercentageChange(newValuePercentage)
        }
        onFocus={() => setInputFocused('percent')}
        suffix="%"
        textAlign="center"
        value={percentage}
      />
      <InputText
        className={styles.element}
        error={formik.errors.valueCryptoSelected}
        isButtonClearVisible={false}
        isDisabled={!isThereSomethingToDistribute}
        isErrorInlineVisible={false}
        onBlur={() => setInputFocused(null)}
        onChange={({ target: { value: newValueString } }) => onValueStringChange(newValueString)}
        onFocus={() => setInputFocused('crypto')}
        suffix="ETH"
        textAlign="center"
        value={formik.values.valueCryptoSelected}
      />
      <Button
        isDisabled={!formik.isValid}
        isHigh
        isLoading={formik.isSubmitting}
        label={isThereSomethingToDistribute ? t('done') : t('close')}
        onClick={isThereSomethingToDistribute ? onCloseAndSave : onClose}
        type="submit"
        variant="cta"
      />
    </div>
  );
};

export default AllocationInputs;
