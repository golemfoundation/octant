import cx from 'classnames';
import { format } from 'date-fns';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Svg from 'components/ui/Svg/Svg';
import Tooltip from 'components/ui/Tooltip';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useDepositValue from 'hooks/queries/useDepositValue';
import useUserSablierStreams from 'hooks/queries/useUserSablierStreams';
import { cross, gift } from 'svg/misc';
import getFormattedValueWithSymbolSuffix from 'utils/getFormattedValueWithSymbolSuffix';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import styles from './RaffleWinnerBadge.module.scss';
import RaffleWinnerBadgeProps from './types';

const RaffleWinnerBadge: FC<RaffleWinnerBadgeProps> = ({ isVisible }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridCurrentGlmLock.raffleWinnerBadge',
  });
  const getValuesToDisplay = useGetValuesToDisplay();

  const { data: depositsValue } = useDepositValue();
  const { data: userSablierStreams } = useUserSablierStreams();

  const userSablierStreamsSumFormatted = userSablierStreams
    ? getValuesToDisplay({
        cryptoCurrency: 'golem',
        showFiatPrefix: false,
        valueCrypto: userSablierStreams.sum,
      })
    : undefined;

  const isSablierStreamCancelled = userSablierStreams?.sablierStreams.some(
    ({ isCancelled }) => isCancelled,
  );

  const userSablierStreamsSumFloat = userSablierStreamsSumFormatted
    ? parseFloat(userSablierStreamsSumFormatted.primary.replace(/\s/g, ''))
    : 0;
  const userSablierStreamsSumFormattedWithSymbolSuffix = getFormattedValueWithSymbolSuffix({
    format: 'thousands',
    precision: 0,
    value: userSablierStreamsSumFloat,
  });

  const tooltipWinningsText = userSablierStreams?.sablierStreams.reduce((acc, curr, index) => {
    const amountFormatted = getValuesToDisplay({
      cryptoCurrency: 'golem',
      showCryptoSuffix: true,
      valueCrypto: parseUnitsBigInt(curr.amount, 'wei'),
    });
    const newRow = t('tooltipWinningRow', {
      date: format(parseInt(curr.dateAvailableForWithdrawal, 10) * 1000, 'd LLL y'),
      value: amountFormatted.primary,
    });

    return index > 0 ? `${acc}\n${newRow}` : newRow;
  }, '');

  const depositsValueFormatted = depositsValue
    ? getValuesToDisplay({
        cryptoCurrency: 'golem',
        showCryptoSuffix: true,
        valueCrypto: depositsValue,
      })
    : undefined;

  const tooltipText = useMemo(() => {
    if (isSablierStreamCancelled) {
      return t('tooltipStreamCancelled');
    }
    if (depositsValue && depositsValue > 0n && depositsValueFormatted) {
      return `${tooltipWinningsText}\n${t('tooltipCurrentBalanceRow', { value: depositsValueFormatted.primary })}`;
    }
    return tooltipWinningsText;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    depositsValue,
    isSablierStreamCancelled,
    tooltipWinningsText,
    depositsValueFormatted?.primary,
  ]);

  return (
    <div
      className={cx(
        styles.root,
        isVisible && styles.isVisible,
        isSablierStreamCancelled && styles.isSablierStreamCancelled,
      )}
    >
      <Tooltip
        childrenClassName={cx(styles.tooltipChildren, isVisible && styles.isVisible)}
        className={styles.tooltipWrapper}
        position="bottom-right"
        text={tooltipText}
        tooltipClassName={styles.tooltip}
      >
        <Svg
          classNameSvg={styles.img}
          img={isSablierStreamCancelled ? cross : gift}
          size={isSablierStreamCancelled ? 1.2 : 1.6}
        />
        {t(isSablierStreamCancelled ? 'textCancelled' : 'text', {
          value: userSablierStreamsSumFormattedWithSymbolSuffix,
        })}
      </Tooltip>
    </div>
  );
};

export default RaffleWinnerBadge;
