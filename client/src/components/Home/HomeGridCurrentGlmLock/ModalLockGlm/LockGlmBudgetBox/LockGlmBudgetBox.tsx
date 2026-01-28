import cx from 'classnames';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';
import { SABLIER_APP_LINK } from 'constants/urls';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useIsMigrationMode from 'hooks/helpers/useIsMigrationMode';
import useDepositValue from 'hooks/queries/useDepositValue';
import useUserSablierStreams from 'hooks/queries/useUserSablierStreams';
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
  const { data: userSablierStreams, isFetching: isFetchinguserSablierStreams } =
    useUserSablierStreams();
  const isInMigrationMode = useIsMigrationMode();

  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridCurrentGlmLock.modalLockGlm.lockGlmBudgetBox',
  });

  const depositsValueString = useMemo(
    () =>
      getFormattedGlmValue({
        value:
          (depositsValue || 0n) +
          ((currentMode === 'lock' && userSablierStreams?.sumAvailable) || 0n),
      }).fullString,
    [depositsValue, currentMode, userSablierStreams?.sumAvailable],
  );

  const shouldRaffleWinningsBeDisplayed =
    currentMode === 'unlock' &&
    userSablierStreams &&
    userSablierStreams.sumAvailable > 0 &&
    !userSablierStreams.sablierStreams.some(({ isCancelled }) => isCancelled);
  const areFundsFetching = isFetchingAvailableFundsGlm || isFetchinguserSablierStreams;

  const secondRowValue = getFormattedGlmValue({
    value: shouldRaffleWinningsBeDisplayed
      ? userSablierStreams?.sumAvailable
      : BigInt(availableFundsGlm ? availableFundsGlm!.value : 0),
  }).fullString;

  const secondRowLabel = useMemo(() => {
    if (shouldRaffleWinningsBeDisplayed) {
      return (
        <div className={styles.timeLockedInSablier}>
          {userSablierStreams.sum === userSablierStreams.sumAvailable
            ? t('timeLockedInSablier')
            : t('lockedInSablier')}
          <Button
            className={styles.unlockInSablierButton}
            href={SABLIER_APP_LINK}
            isButtonScalingUpOnHover={false}
            variant="link"
          >
            {t('unlockInSablier')}
          </Button>
        </div>
      );
    }
    return t('walletBalance');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRaffleWinningsBeDisplayed, userSablierStreams?.sablierStreams.length, i18n.language]);

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
        <div className={styles.budgetLabel}>
          {t(shouldRaffleWinningsBeDisplayed ? 'availableToUnlock' : 'currentlyLocked')}
        </div>
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
      {!isInMigrationMode && (
        <div className={styles.budgetRow}>
          <div className={styles.budgetLabel}>{secondRowLabel}</div>
          <AvailableFundsGlm
            classNameBudgetValue={cx(styles.budgetValue, isWalletBalanceError && styles.isError)}
            classNameSkeleton={styles.skeleton}
            isLoading={areFundsFetching}
            value={secondRowValue}
          />
        </div>
      )}
    </BoxRounded>
  );
};

export default LockGlmBudgetBox;
