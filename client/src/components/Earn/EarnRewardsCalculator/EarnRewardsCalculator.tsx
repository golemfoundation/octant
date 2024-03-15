import cx from 'classnames';
import { useFormik } from 'formik';
import debounce from 'lodash/debounce';
import React, { FC, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import InputText from 'components/ui/InputText';
import useCalculateRewards from 'hooks/mutations/useCalculateRewards';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import i18n from 'i18n';
import useSettingsStore from 'store/settings/store';
import { FormattedCryptoValue } from 'types/formattedCryptoValue';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import getFormattedEthValue from 'utils/getFormattedEthValue';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';
import { comma, floatNumberWithUpTo18DecimalPlaces, numbersOnly } from 'utils/regExp';

import styles from './EarnRewardsCalculator.module.scss';
import { FormFields } from './types';
import { formInitialValues, validationSchema } from './utils';

const EarnRewardsCalculator: FC = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.rewardsCalculator',
  });
  const {
    data: { displayCurrency, isCryptoMainValueDisplay },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { data: cryptoValues } = useCryptoValues(displayCurrency);
  const {
    data: calculateRewards,
    mutateAsync: mutateAsyncRewardsCalculator,
    reset: resetCalculateRewards,
    isPending: isPendingCalculateRewards,
  } = useCalculateRewards();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchEstimatedRewardsDebounced = useCallback(
    debounce(({ amountGlm, numberOfDays }) => {
      const amountGlmWEI = formatUnitsBigInt(parseUnitsBigInt(amountGlm, 'ether'), 'wei');
      const numberOfDaysNumber = parseInt(numberOfDays, 10);

      resetCalculateRewards();
      mutateAsyncRewardsCalculator({ amountGlm: amountGlmWEI, numberOfDays: numberOfDaysNumber });
    }, 300),
    [],
  );

  const formik = useFormik<FormFields>({
    initialValues: formInitialValues,
    onSubmit: values =>
      fetchEstimatedRewardsDebounced({ amountGlm: values.valueCrypto, numberOfDays: values.days }),
    validateOnChange: true,
    validationSchema: validationSchema(t),
  });

  const onCryptoValueChange = (value: string) => {
    const valueComma = value.replace(comma, '.');

    if (valueComma && !floatNumberWithUpTo18DecimalPlaces.test(valueComma)) {
      return;
    }

    formik.setFieldValue('valueCrypto', valueComma || '');
  };

  const onDaysInputChange = (value: string) => {
    if (!numbersOnly.test(value)) {
      return;
    }
    formik.setFieldValue('days', value);
  };

  useEffect(() => {
    formik.validateForm().then(() => {
      fetchEstimatedRewardsDebounced({
        amountGlm: formik.values.valueCrypto,
        numberOfDays: formik.values.days,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.valueCrypto, formik.values.days]);

  useEffect(() => {
    return () => {
      resetCalculateRewards();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const estimatedFormattedRewardsValue: FormattedCryptoValue =
    formik.values.valueCrypto && formik.values.days && calculateRewards
      ? getFormattedEthValue(parseUnitsBigInt(calculateRewards.budget, 'wei'))
      : {
          fullString: '',
          suffix: 'ETH',
          value: '',
        };

  const cryptoFiatRatio = cryptoValues?.ethereum[displayCurrency || 'usd'] || 1;
  const fiat = estimatedFormattedRewardsValue.value
    ? (parseFloat(estimatedFormattedRewardsValue.value) * cryptoFiatRatio).toFixed(2)
    : '';

  return (
    <BoxRounded dataTest="RewardsCalculator" isGrey isVertical>
      <InputText
        autocomplete="off"
        className={styles.input}
        dataTest="RewardsCalculator__InputText--crypto"
        error={formik.errors.valueCrypto}
        inputMode="decimal"
        isButtonClearVisible={false}
        label={t('enterGLMAmount')}
        onChange={e => onCryptoValueChange(e.target.value)}
        suffix="GLM"
        value={formik.values.valueCrypto}
      />
      <InputText
        className={styles.input}
        dataTest="RewardsCalculator__InputText--days"
        inputMode="numeric"
        isButtonClearVisible={false}
        label={t('lockFor')}
        onChange={e => onDaysInputChange(e.target.value)}
        shouldAutoFocusAndSelect={false}
        suffix={i18n.t('common.days').toUpperCase()}
        value={formik.values.days}
      />
      <div
        className={cx(
          styles.cryptoFiatInputs,
          isCryptoMainValueDisplay && styles.isCryptoMainValueDisplay,
        )}
      >
        <InputText
          className={cx(styles.input, isCryptoMainValueDisplay && styles.isCryptoMainValueDisplay)}
          dataTest="RewardsCalculator__InputText--estimatedRewards--crypto"
          isButtonClearVisible={false}
          isDisabled
          shouldAutoFocusAndSelect={false}
          showLoader={isPendingCalculateRewards}
          suffix={estimatedFormattedRewardsValue.suffix}
          suffixClassName={styles.estimatedRewardsSuffix}
          value={estimatedFormattedRewardsValue.value}
          {...(isCryptoMainValueDisplay && {
            label: t('estimatedRewards'),
          })}
        />
        <InputText
          className={cx(styles.input, !isCryptoMainValueDisplay && styles.isFiatMainValueDisplay)}
          dataTest="RewardsCalculator__InputText--estimatedRewards--fiat"
          isButtonClearVisible={false}
          isDisabled
          shouldAutoFocusAndSelect={false}
          showLoader={isPendingCalculateRewards}
          suffix={displayCurrency.toUpperCase()}
          suffixClassName={styles.estimatedRewardsSuffix}
          value={fiat}
          {...(!isCryptoMainValueDisplay && {
            label: t('estimatedRewards'),
          })}
        />
      </div>
    </BoxRounded>
  );
};

export default EarnRewardsCalculator;
