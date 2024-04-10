import { useFormik } from 'formik';
import debounce from 'lodash/debounce';
import React, { FC, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import InputText from 'components/ui/InputText';
import useCalculateRewards from 'hooks/mutations/useCalculateRewards';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useSettingsStore from 'store/settings/store';
import { FormattedCryptoValue } from 'types/formattedCryptoValue';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import getFormattedEthValue from 'utils/getFormattedEthValue';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';
import { comma, floatNumberWithUpTo18DecimalPlaces } from 'utils/regExp';

import styles from './EarnRewardsCalculator.module.scss';
import EarnRewardsCalculatorDaysSelector from './EarnRewardsCalculatorDaysSelector';
import EarnRewardsCalculatorEstimates from './EarnRewardsCalculatorEstimates';
import { FormFields } from './types';
import { formInitialValues, validationSchema } from './utils';

const EarnRewardsCalculator: FC = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.rewardsCalculator',
  });
  const {
    data: { displayCurrency },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
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

  const estimatedFormattedRewardsValue: FormattedCryptoValue =
    formik.values.valueCrypto && formik.values.days && calculateRewards
      ? getFormattedEthValue(parseUnitsBigInt(calculateRewards.budget, 'wei'))
      : {
          fullString: '',
          suffix: 'ETH',
          value: '',
        };

  const cryptoFiatRatio = cryptoValues?.ethereum[displayCurrency || 'usd'] || 1;
  const estimatedRewardsFiat = estimatedFormattedRewardsValue.value
    ? `$${(parseFloat(estimatedFormattedRewardsValue.value) * cryptoFiatRatio).toFixed(2)}`
    : '';

  useEffect(() => {
    if (!formik.values.valueCrypto || !formik.values.days) {
      return;
    }
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

  return (
    <BoxRounded dataTest="RewardsCalculator" isGrey isVertical>
      <InputText
        autocomplete="off"
        className={styles.glmInput}
        dataTest="RewardsCalculator__InputText--crypto"
        error={formik.errors.valueCrypto}
        inputMode="decimal"
        isButtonClearVisible={false}
        label={t('enterGLMAmount')}
        onChange={e => onCryptoValueChange(e.target.value)}
        suffix="GLM"
        value={formik.values.valueCrypto}
      />
      <EarnRewardsCalculatorDaysSelector
        days={formik.values.days}
        onChange={days => {
          formik.setFieldValue('days', days);
        }}
      />
      <EarnRewardsCalculatorEstimates
        isLoading={isPendingCalculateRewards}
        // TODO: Fetch and pass correct matchFunding value in fiat
        matchFundingFiat={estimatedRewardsFiat}
        rewardsFiat={estimatedRewardsFiat}
      />
    </BoxRounded>
  );
};

export default EarnRewardsCalculator;
