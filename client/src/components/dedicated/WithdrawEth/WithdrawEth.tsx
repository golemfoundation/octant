import cx from 'classnames';
import { useFormik } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import InputsCryptoFiat from 'components/dedicated/InputsCryptoFiat/InputsCryptoFiat';
import TimeCounter from 'components/dedicated/TimeCounter/TimeCounter';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useWithdrawEth from 'hooks/mutations/useWithdrawEth';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useWithdrawableUserEth from 'hooks/queries/useWithdrawableUserEth';
import triggerToast from 'utils/triggerToast';

import { FormFields } from './types';
import { validationSchema, formInitialValues } from './utils';
import styles from './WithdrawEth.module.scss';

const WithdrawEth: FC = () => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.withdrawEth',
  });
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: withdrawableUserEth } = useWithdrawableUserEth();
  const { data: isDecisionWindowOpen, refetch: refetchIsDecisionWindowOpen } =
    useIsDecisionWindowOpen();
  const { data: currentEpochProps } = useCurrentEpochProps();
  const { timeCurrentAllocationEnd } = useEpochAndAllocationTimestamps();
  const withdrawEthMutation = useWithdrawEth({
    onSuccess: () => {
      triggerToast({
        title: i18n.t('common.transactionSuccessful'),
      });
    },
  });

  const formik = useFormik<FormFields>({
    initialValues: formInitialValues,
    onSubmit: ({ valueToWithdraw }) => withdrawEthMutation.mutateAsync(valueToWithdraw),
    validateOnChange: true,
    validationSchema: validationSchema(withdrawableUserEth),
  });

  return (
    <form className={styles.form} onSubmit={formik.handleSubmit}>
      {isDecisionWindowOpen && (
        <BoxRounded className={styles.element} isGrey isVertical>
          {t('withdrawalsDistributedEpoch', {
            currentEpoch,
          })}
          <TimeCounter
            className={styles.timeCounter}
            duration={currentEpochProps?.decisionWindow}
            onCountingFinish={refetchIsDecisionWindowOpen}
            timestamp={timeCurrentAllocationEnd}
            variant="small"
          />
        </BoxRounded>
      )}
      <BoxRounded
        alignment="left"
        className={styles.element}
        isGrey
        isVertical
        title={t('rewardsBudget')}
      >
        <DoubleValue
          cryptoCurrency="ethereum"
          isError={!formik.isValid}
          valueCrypto={withdrawableUserEth}
        />
      </BoxRounded>
      <BoxRounded className={styles.element} isGrey isVertical>
        <InputsCryptoFiat
          cryptoCurrency="ethereum"
          error={formik.errors.valueToWithdraw}
          inputCryptoProps={{
            isDisabled: withdrawEthMutation.isLoading,
            name: 'valueToWithdraw',
            onChange: value => {
              formik.setFieldValue('valueToWithdraw', value);
            },
            onClear: formik.resetForm,
            suffix: 'ETH',
            value: formik.values.valueToWithdraw,
          }}
          label={t('amountToWithdraw')}
        />
      </BoxRounded>
      <Button
        className={cx(styles.element, styles.button)}
        isDisabled={!formik.isValid}
        isHigh
        isLoading={formik.isSubmitting}
        label={t('requestWithdrawal')}
        type="submit"
        variant="cta"
      />
    </form>
  );
};

export default WithdrawEth;
