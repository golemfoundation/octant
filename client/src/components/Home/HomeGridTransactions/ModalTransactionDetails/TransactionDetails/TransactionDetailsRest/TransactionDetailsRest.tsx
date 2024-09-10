import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransaction } from 'wagmi';

import TransactionDetailsDateAndTime from 'components/Home/HomeGridTransactions/ModalTransactionDetails/TransactionDetails/TransactionDetailsDateAndTime';
import TransactionLabel from 'components/Home/HomeGridTransactions/TransactionLabel';
import BoxRounded from 'components/ui/BoxRounded';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/ui/BoxRounded/Sections/types';
import Button from 'components/ui/Button';
import networkConfig from 'constants/networkConfig';

import styles from './TransactionDetailsRest.module.scss';
import TransactionDetailsRestProps from './types';

const TransactionDetailsRest: FC<TransactionDetailsRestProps> = ({
  eventData,
  type,
  timestamp,
  isFinalized = true,
  isWaitingForTransactionInitialized,
  isMultisig = false,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridTransactions.modalTransactionDetails',
  });
  const { data: transaction, isFetching: isFetchingTransaction } = useTransaction({
    hash: isWaitingForTransactionInitialized ? undefined : eventData.transactionHash,
  });

  const isPatronDonation = type === 'patron_mode_donation';

  const sections: SectionProps[] = [
    {
      dataTest: isPatronDonation
        ? 'TransactionDetailsRest__matchingFundDonation'
        : 'TransactionDetailsRest__amount',
      doubleValueProps: {
        dataTest: isPatronDonation
          ? 'TransactionDetailsRest__matchingFundDonation__DoubleValue'
          : 'TransactionDetailsRest__amount__DoubleValue',
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
            childrenLeft: <TransactionLabel isFinalized={isFinalized} isMultisig={isMultisig} />,
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
      childrenRight: <TransactionDetailsDateAndTime timestamp={timestamp} />,
      label: t('sections.when'),
    },
  ];

  return (
    <BoxRounded alignment="left" hasSections isGrey isVertical>
      <Sections hasBottomDivider sections={sections} variant="small" />
    </BoxRounded>
  );
};

export default TransactionDetailsRest;
