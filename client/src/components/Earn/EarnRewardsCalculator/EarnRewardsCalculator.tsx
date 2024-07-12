import { useFormik } from 'formik';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import React, { FC, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import InputText from 'components/ui/InputText';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useCalculateRewards from 'hooks/mutations/useCalculateRewards';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';
import { comma, floatNumberWithUpTo18DecimalPlaces } from 'utils/regExp';

import styles from './EarnRewardsCalculator.module.scss';
import EarnRewardsCalculatorEpochDaysSelector from './EarnRewardsCalculatorEpochDaysSelector';
import EarnRewardsCalculatorEstimates from './EarnRewardsCalculatorEstimates';
import EarnRewardsCalculatorUqSelector from './EarnRewardsCalculatorUqSelector';
import { FormFields } from './types';
import { formInitialValues, validationSchema } from './utils';

const EarnRewardsCalculator: FC = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.rewardsCalculator',
  });

  const getValuesToDisplay = useGetValuesToDisplay();

  const {
    data: calculateRewards,
    mutateAsync: mutateAsyncRewardsCalculator,
    reset: resetCalculateRewards,
    isPending: isPendingCalculateRewards,
  } = useCalculateRewards();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchEstimatedRewardsDebounced = useCallback(
    debounce(({ amountGlm, numberOfEpochs }) => {
      const amountGlmWEI = formatUnitsBigInt(parseUnitsBigInt(amountGlm, 'ether'), 'wei');
      resetCalculateRewards();
      mutateAsyncRewardsCalculator({ amountGlm: amountGlmWEI, numberOfEpochs });
    }, 300),
    [],
  );

  const formik = useFormik<FormFields>({
    initialValues: formInitialValues,
    onSubmit: values =>
      fetchEstimatedRewardsDebounced({
        amountGlm: values.valueCrypto,
        numberOfEpochs: values.numberOfEpochs,
      }),
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

  const estimatedRewards =
    calculateRewards && isEmpty(formik.errors) && !isEmpty(formik.values.valueCrypto)
      ? getValuesToDisplay({
          cryptoCurrency: 'ethereum',
          showCryptoSuffix: true,
          valueCrypto: parseUnitsBigInt(calculateRewards.budget, 'wei'),
        })
      : undefined;

  const matchFunding =
    calculateRewards && isEmpty(formik.errors) && !isEmpty(formik.values.valueCrypto)
      ? getValuesToDisplay({
          cryptoCurrency: 'ethereum',
          showCryptoSuffix: true,
          valueCrypto:
            (parseUnitsBigInt(calculateRewards.matchedFunding, 'wei') *
              (formik.values.isUqScoreOver20 ? 100n : 20n)) /
            100n,
        })
      : undefined;

  useEffect(() => {
    if (!formik.values.valueCrypto || !formik.values.numberOfEpochs) {
      return;
    }
    formik.validateForm().then(errors => {
      if (!isEmpty(errors)) {
        return;
      }
      fetchEstimatedRewardsDebounced({
        amountGlm: formik.values.valueCrypto,
        numberOfEpochs: formik.values.numberOfEpochs,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.valueCrypto, formik.values.numberOfEpochs]);

  useEffect(() => {
    return () => {
      resetCalculateRewards();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BoxRounded dataTest="EarnRewardsCalculator" isGrey isVertical>
      <InputText
        autocomplete="off"
        className={styles.glmInput}
        dataTest="EarnRewardsCalculator__InputText--glm"
        error={formik.errors.valueCrypto}
        inputMode="decimal"
        isButtonClearVisible={false}
        label={t('enterGLMAmount')}
        onChange={e => onCryptoValueChange(e.target.value)}
        suffix="GLM"
        value={formik.values.valueCrypto}
      />
      <EarnRewardsCalculatorEpochDaysSelector
        numberOfEpochs={formik.values.numberOfEpochs}
        onChange={epoch => {
          formik.setFieldValue('numberOfEpochs', epoch);
        }}
      />
      <EarnRewardsCalculatorUqSelector
        isUqScoreOver20={formik.values.isUqScoreOver20}
        onChange={isUqScoreOver20 => {
          formik.setFieldValue('isUqScoreOver20', isUqScoreOver20);
        }}
      />
      <EarnRewardsCalculatorEstimates
        estimatedRewards={estimatedRewards}
        isLoading={isPendingCalculateRewards}
        matchFunding={matchFunding}
      />
    </BoxRounded>
  );
};

export default EarnRewardsCalculator;
