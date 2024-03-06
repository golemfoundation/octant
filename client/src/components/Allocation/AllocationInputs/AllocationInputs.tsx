import cx from 'classnames';
import { useFormik } from 'formik';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/ui/Button';
import InputText from 'components/ui/InputText';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';
import { comma, floatNumberWithUpTo18DecimalPlaces, percentageOnly } from 'utils/regExp';

import styles from './AllocationInputs.module.scss';
import AllocationInputsProps, { FormFields } from './types';
import { formInitialValues, validationSchema } from './utils';

const AllocationInputs: FC<AllocationInputsProps> = ({
  className,
  isManuallyEdited,
  onClose,
  valueCryptoSelected,
  valueCryptoTotal,
  restToDistribute = valueCryptoTotal,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'common',
  });
  const [percentage, setPercentage] = useState<string>('');
  // Whenever editing already edited entry, restToDistribute should be increased by whatever is set here.
  const restToDistributeAdjusted = isManuallyEdited
    ? restToDistribute + valueCryptoSelected
    : restToDistribute;

  const formik = useFormik<FormFields>({
    initialValues: formInitialValues(valueCryptoSelected),
    onSubmit: () => {},
    validateOnChange: true,
    validationSchema: validationSchema(valueCryptoTotal, restToDistributeAdjusted),
  });

  useEffect(() => {
    setPercentage(
      valueCryptoTotal === 0n ? '0' : ((valueCryptoSelected * 100n) / valueCryptoTotal).toString(),
    );
    formik.setFieldValue('valueCryptoSelected', formatUnitsBigInt(valueCryptoSelected));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueCryptoSelected, valueCryptoTotal]);

  const formikUpdateValues = (newValueString: string, newValuePercentage: string) => {
    setPercentage(newValuePercentage);
    formik.setFieldValue('valueCryptoSelected', newValueString);
    // https://github.com/jaredpalmer/formik/issues/2059#issuecomment-612733378
    setTimeout(() => formik.setFieldTouched('valueCryptoSelected', true));
  };

  const onValuePercentageChange = (newValuePercentage: string) => {
    if (newValuePercentage && !percentageOnly.test(newValuePercentage)) {
      return;
    }
    const newValueBigInt = newValuePercentage
      ? (valueCryptoTotal * BigInt(newValuePercentage)) / 100n
      : BigInt(0);
    formikUpdateValues(formatUnitsBigInt(newValueBigInt), newValuePercentage);
  };

  const onValueStringChange = (newValueString: string): void => {
    const valueComma = newValueString.replace(comma, '.');
    if (valueComma && !floatNumberWithUpTo18DecimalPlaces.test(valueComma)) {
      return;
    }

    const newValueBigInt = parseUnitsBigInt(newValueString || '0');
    let newPercentage = newValueString
      ? ((newValueBigInt * 100n) / valueCryptoTotal).toString()
      : '0';
    newPercentage = parseInt(newPercentage, 10) > 100 ? '100' : newPercentage;
    formikUpdateValues(newValueString, newPercentage);
  };

  const isThereSomethingToDistribute = restToDistributeAdjusted !== 0n;

  return (
    <div className={cx(styles.root, className)}>
      <div className={styles.inputsContainer}>
        <InputText
          className={styles.input}
          error={formik.errors.valueCryptoSelected}
          inputMode="decimal"
          isButtonClearVisible={false}
          isDisabled={!isThereSomethingToDistribute}
          isErrorInlineVisible={false}
          onChange={({ target: { value: newValueString } }) => onValueStringChange(newValueString)}
          suffix="ETH"
          textAlign="left"
          value={formik.values.valueCryptoSelected}
        />
        <InputText
          className={cx(styles.input, styles.percentageInput)}
          inputMode="decimal"
          isButtonClearVisible={false}
          isDisabled={!isThereSomethingToDistribute}
          onChange={({ target: { value: newValuePercentage } }) =>
            onValuePercentageChange(newValuePercentage)
          }
          shouldAutoFocusAndSelect={false}
          suffix="%"
          textAlign="left"
          value={percentage}
        />
        <Button
          isDisabled={!formik.isValid}
          isHigh
          isLoading={formik.isSubmitting}
          label={isThereSomethingToDistribute ? t('done') : t('close')}
          onClick={() => onClose(parseUnitsBigInt(formik.values.valueCryptoSelected))}
          type="submit"
          variant="cta"
        />
      </div>
    </div>
  );
};

export default AllocationInputs;
