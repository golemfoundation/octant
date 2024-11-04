import cx from 'classnames';
import { format } from 'date-fns';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useDepositValue from 'hooks/queries/useDepositValue';
import useUserRaffleWinnings from 'hooks/queries/useUserRaffleWinnings';
import getFormattedGlmValue from 'utils/getFormattedGlmValue';

import AvailableFundsGlm from './AvailableFundsGlm';
import styles from './LockGlmBudgetBox.module.scss';
import LockGlmBudgetBoxProps from './types';

const LockGlmBudgetBox: FC<LockGlmBudgetBoxProps> = ({
  className,
  currentMode,
  isWalletBalanceError,
  isCurrentlyLockedError,
}) => {
  const { data: depositsValue, isFetching: isFetchingDepositValue } = useDepositValue();
  const { data: availableFundsGlm, isFetching: isFetchingAvailableFundsGlm } =
    useAvailableFundsGlm();
  const { data: userRaffleWinnings, isFetching: isFetchingUserRaffleWinnings } =
    useUserRaffleWinnings();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridCurrentGlmLock.modalLockGlm.lockGlmBudgetBox',
  });

  const depositsValueString = useMemo(
    () => getFormattedGlmValue({ value: depositsValue || BigInt(0) }).fullString,
    [depositsValue],
  );

  const shouldRaffleWinningsBeDisplayed =
    currentMode === 'unlock' && userRaffleWinnings && userRaffleWinnings.sum > 0;
  const areFundsFetching = isFetchingAvailableFundsGlm || isFetchingUserRaffleWinnings;

  const secondRowValue = getFormattedGlmValue({
    value: shouldRaffleWinningsBeDisplayed
      ? userRaffleWinnings?.sum
      : BigInt(availableFundsGlm ? availableFundsGlm!.value : 0),
  }).fullString;

  const secondRowLabel = useMemo(() => {
    if (shouldRaffleWinningsBeDisplayed) {
      const date = format(
        parseInt(userRaffleWinnings?.winnings[0].dateAvailableForWithdrawal, 10) * 1000,
        'd LLL y',
      );
      return userRaffleWinnings?.winnings.length > 1
        ? t('raffleWinnings.multipleWins')
        : t('raffleWinnings.oneWin', { date });
    }
    return t('walletBalance');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRaffleWinningsBeDisplayed, userRaffleWinnings?.winnings.length]);

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
        <div className={styles.budgetLabel}>{secondRowLabel}</div>
        <AvailableFundsGlm
          classNameBudgetValue={cx(styles.budgetValue && isWalletBalanceError && styles.isError)}
          classNameSkeleton={styles.skeleton}
          isLoading={areFundsFetching}
          value={secondRowValue}
        />
      </div>
    </BoxRounded>
  );
};

export default LockGlmBudgetBox;
