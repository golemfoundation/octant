import cx from 'classnames';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useDepositValue from 'hooks/queries/useDepositValue';
import getFormattedGlmValue from 'utils/getFormattedGlmValue';

import styles from './LockGlmBudgetBox.module.scss';
import LockGlmBudgetBoxProps from './types';

const LockGlmBudgetBox: FC<LockGlmBudgetBoxProps> = ({
  className,
  isWalletBalanceError,
  isCurrentlyLockedError,
}) => {
  const { data: depositsValue, isFetching: isFetchingDepositValue } = useDepositValue();
  const { data: availableFundsGlm, isFetched: isFetchedAvailableFundsGlm } = useAvailableFundsGlm();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridCurrentGlmLock.modalLockGlm.lockGlmBudgetBox',
  });

  const depositsValueString = useMemo(
    () => getFormattedGlmValue({ value: depositsValue || BigInt(0) }).fullString,
    [depositsValue],
  );

  const availableFundsGlmString = getFormattedGlmValue({
    value: BigInt(availableFundsGlm ? availableFundsGlm!.value : 0),
  }).fullString;

  return (
    <BoxRounded
      alignment="left"
      className={className}
      dataTest="LockGlmBudgetBox"
      hasPadding={false}
      isGrey
      isVertical
    >
      <div className={styles.budgetRow}>
        <div className={styles.budgetLabel}>{t('currentlyLocked')}</div>
        {isFetchingDepositValue ? (
          <div className={styles.skeleton} />
        ) : (
          <div
            className={cx(styles.budgetValue, isCurrentlyLockedError && styles.isError)}
            data-test="LockGlmBudgetBox__currentlyLocked__value"
          >
            {depositsValueString}
          </div>
        )}
      </div>
      <div className={styles.budgetRow}>
        <div className={styles.budgetLabel}>{t('walletBalance')}</div>
        {!isFetchedAvailableFundsGlm ? (
          <div className={styles.skeleton} />
        ) : (
          <div
            className={cx(styles.budgetValue, isWalletBalanceError && styles.isError)}
            data-test="LockGlmBudgetBox__walletBalance__value"
          >
            {availableFundsGlmString}
          </div>
        )}
      </div>
    </BoxRounded>
  );
};

export default LockGlmBudgetBox;
