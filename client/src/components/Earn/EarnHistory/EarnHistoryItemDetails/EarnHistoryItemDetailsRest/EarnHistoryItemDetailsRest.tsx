import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransaction } from 'wagmi';

import EarnHistoryItemDateAndTime from 'components/Earn/EarnHistory/EarnHistoryItemDetails/EarnHistoryItemDateAndTime';
import EarnHistoryTransactionLabel from 'components/Earn/EarnHistory/EarnHistoryTransactionLabel';
import BoxRounded from 'components/ui/BoxRounded';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/ui/BoxRounded/Sections/types';
import Button from 'components/ui/Button';
import networkConfig from 'constants/networkConfig';

import styles from './EarnHistoryItemDetailsRest.module.scss';
import EarnHistoryItemDetailsRestProps from './types';

const EarnHistoryItemDetailsRest: FC<EarnHistoryItemDetailsRestProps> = ({
  eventData,
  type,
  timestamp,
  isFinalized = true,
  isWaitingForTransactionInitialized,
  isMultisig = false,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.historyItemModal',
  });
  const { data: transaction, isFetching: isFetchingTransaction } = useTransaction({
    hash: isWaitingForTransactionInitialized ? undefined : eventData.transactionHash,
  });

  const isPatronDonation = type === 'patron_mode_donation';

  const sections: SectionProps[] = [
    {
      dataTest: isPatronDonation
        ? 'EarnHistoryItemDetailsRest__matchingFundDonation'
        : 'EarnHistoryItemDetailsRest__amount',
      doubleValueProps: {
        dataTest: isPatronDonation
          ? 'EarnHistoryItemDetailsRest__matchingFundDonation__DoubleValue'
          : 'EarnHistoryItemDetailsRest__amount__DoubleValue',
        valueCrypto: eventData.amount,
        ...(['withdrawal', 'patron_mode_donation'].includes(type)
          ? { cryptoCurrency: 'ethereum', getFormattedEthValueProps: { shouldIgnoreGwei: true } }
          : { cryptoCurrency: 'golem' }),
        showCryptoSuffix: true,
      },
      label: isPatronDonation ? t('sections.matchingFundDonation') : t('sections.amount'),
    },
    ...((!isPatronDonation
      ? [
          {
            doubleValueProps: {
              cryptoCurrency: 'ethereum',
              getFormattedEthValueProps: { shouldIgnoreGwei: true },
              // Gas price is not known for pending transactions.
              isFetching: isFetchingTransaction || isWaitingForTransactionInitialized,
              showCryptoSuffix: true,
              valueCrypto: BigInt(transaction?.gasPrice ?? 0),
            },
            label: t('sections.gasPrice'),
          },
          {
            childrenLeft: (
              <EarnHistoryTransactionLabel isFinalized={isFinalized} isMultisig={isMultisig} />
            ),
            childrenRight: (
              <Button
                className={cx(styles.viewOnEtherscan, isMultisig && styles.isMultisig)}
                href={`${networkConfig.etherscanAddress}/tx/${eventData.transactionHash}`}
                label={t('sections.viewOnEtherscan')}
                variant="link"
              />
            ),
          },
        ]
      : []) as SectionProps[]),
    {
      childrenRight: <EarnHistoryItemDateAndTime timestamp={timestamp} />,
      label: t('sections.when'),
    },
  ];

  return (
    <BoxRounded alignment="left" hasSections isGrey isVertical>
      <Sections hasBottomDivider sections={sections} variant="small" />
    </BoxRounded>
  );
};

export default EarnHistoryItemDetailsRest;
