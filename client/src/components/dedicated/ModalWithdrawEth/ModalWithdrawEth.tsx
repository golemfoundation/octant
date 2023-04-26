import cx from 'classnames';
import { useFormik } from 'formik';
import React, { FC, useEffect } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import Modal from 'components/core/Modal/Modal';
import InputsCryptoFiat from 'components/dedicated/InputsCryptoFiat/InputsCryptoFiat';
import TimeCounter from 'components/dedicated/TimeCounter/TimeCounter';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useWithdrawEth from 'hooks/mutations/useWithdrawEth';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useWithdrawableUserEth from 'hooks/queries/useWithdrawableUserEth';
import { floatNumberWithUpTo18DecimalPlaces } from 'utils/regExp';
import triggerToast from 'utils/triggerToast';

import styles from './ModalWithdrawEth.module.scss';
import ModalEthWithdrawingProps, { FormValues } from './types';
import { validationSchema, formInitialValues } from './utils';

const ModalWithdrawEth: FC<ModalEthWithdrawingProps> = ({ modalProps }) => {
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: withdrawableUserEth } = useWithdrawableUserEth();
  const { data: isDecisionWindowOpen, refetch: refetchIsDecisionWindowOpen } =
    useIsDecisionWindowOpen();
  const { data: currentEpochProps } = useCurrentEpochProps();
  const { timeCurrentAllocationEnd } = useEpochAndAllocationTimestamps();
  const withdrawEthMutation = useWithdrawEth({
    onSuccess: () => {
      triggerToast({
        title: 'Transaction successful',
      });
    },
  });

  const formik = useFormik<FormValues>({
    initialValues: formInitialValues,
    onSubmit: ({ valueToWithdraw }) => withdrawEthMutation.mutateAsync(valueToWithdraw),
    validateOnChange: true,
    validationSchema: validationSchema(withdrawableUserEth),
  });

  useEffect(() => {
    formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalProps.isOpen]);

  return (
    <Modal header="Withdraw ETH" {...modalProps}>
      <form className={styles.form} onSubmit={formik.handleSubmit}>
        {isDecisionWindowOpen && (
          <BoxRounded className={styles.element} isGrey isVertical>
            Withdrawals are distributed when Epoch {currentEpoch} ends
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
          title="Rewards Budget"
        >
          <DoubleValue
            cryptoCurrency="ethereum"
            isError={!formik.isValid}
            valueCrypto={withdrawableUserEth}
          />
        </BoxRounded>
        <BoxRounded className={styles.element} isGrey isVertical>
          <InputsCryptoFiat
            error={formik.errors.valueToWithdraw}
            inputCryptoProps={{
              isDisabled: withdrawEthMutation.isLoading,
              name: 'valueToWithdraw',
              onChange: event => {
                const {
                  target: { value },
                } = event;
                if (value && !floatNumberWithUpTo18DecimalPlaces.test(value)) {
                  return;
                }

                formik.handleChange(event);
              },
              onClear: formik.resetForm,
              suffix: 'ETH',
              value: formik.values.valueToWithdraw,
            }}
            label="Amount to withdraw"
          />
        </BoxRounded>
        <Button
          className={cx(styles.element, styles.button)}
          isDisabled={!formik.isValid}
          isHigh
          isLoading={formik.isSubmitting}
          label="Request withdrawal"
          type="submit"
          variant="cta"
        />
      </form>
    </Modal>
  );
};

export default ModalWithdrawEth;
