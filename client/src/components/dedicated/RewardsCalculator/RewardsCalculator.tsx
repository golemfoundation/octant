import cx from 'classnames';
import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useFormik } from 'formik';
import debounce from 'lodash/debounce';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { apiPostCalculateRewards } from 'api/calls/calculateRewards';
import clientReactQuery from 'api/clients/client-react-query';
import { QUERY_KEYS, ROOTS } from 'api/queryKeys';
import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import InputText from 'components/core/InputText/InputText';
import { GLM_TOTAL_SUPPLY } from 'constants/currencies';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import i18n from 'i18n';
import useSettingsStore from 'store/settings/store';
import { FormattedCryptoValue } from 'types/formattedCryptoValue';
import getFormattedEthValue from 'utils/getFormattedEthValue';
import { comma, floatNumberWithUpTo18DecimalPlaces, numbersOnly } from 'utils/regExp';

import styles from './RewardsCalculator.module.scss';
import { FormFields } from './types';
import { formInitialValues, validationSchema } from './utils';

const RewardsCalculator: FC = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.rewardsCalculator',
  });
  const [estimatedRewards, setEstimatedRewards] = useState<BigNumber | undefined>();
  const [isFetching, setIsFetching] = useState(false);
  const {
    data: { displayCurrency, isCryptoMainValueDisplay },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { data: cryptoValues } = useCryptoValues(displayCurrency);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchEstimatedRewardsDebounced = useCallback(
    debounce((amountGlm, d) => {
      const isFetchingRewards = clientReactQuery.isFetching({ queryKey: [ROOTS.calculateRewards] });

      if (!amountGlm || !d || parseUnits(amountGlm).gt(GLM_TOTAL_SUPPLY)) {
        if (isFetchingRewards) {
          clientReactQuery.cancelQueries({ queryKey: [ROOTS.calculateRewards] });
        }
        setEstimatedRewards(undefined);
        setIsFetching(false);
        return;
      }

      if (isFetchingRewards) {
        clientReactQuery.cancelQueries({ queryKey: [ROOTS.calculateRewards] });
      }

      const amountGlmWEI = formatUnits(parseUnits(amountGlm, 'ether'), 'wei');
      setIsFetching(true);

      clientReactQuery
        .fetchQuery({
          queryFn: ({ signal }) => apiPostCalculateRewards(amountGlmWEI, parseInt(d, 10), signal),
          queryKey: QUERY_KEYS.calculateRewards(amountGlmWEI, parseInt(d, 10)),
        })
        .then(res => {
          setIsFetching(false);
          setEstimatedRewards(parseUnits(res.budget, 'wei'));
        });
    }, 300),
    [],
  );

  const formik = useFormik<FormFields>({
    initialValues: formInitialValues,
    onSubmit: values => fetchEstimatedRewardsDebounced(values.valueCrypto, values.days),
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
      fetchEstimatedRewardsDebounced(formik.values.valueCrypto, formik.values.days);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.valueCrypto, formik.values.days]);

  const estimatedFormattedRewardsValue: FormattedCryptoValue =
    formik.values.valueCrypto && formik.values.days && estimatedRewards
      ? getFormattedEthValue(estimatedRewards)
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
          showLoader={isFetching}
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
          showLoader={isFetching}
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

export default RewardsCalculator;
