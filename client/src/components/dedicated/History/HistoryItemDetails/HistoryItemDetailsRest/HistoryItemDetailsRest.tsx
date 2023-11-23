import { BigNumber } from 'ethers';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransaction } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import Button from 'components/core/Button/Button';
import HistoryItemDateAndTime from 'components/dedicated/History/HistoryItemDetails/HistoryItemDateAndTime/HistoryItemDateAndTime';
import HistoryTransactionLabel from 'components/dedicated/History/HistoryTransactionLabel/HistoryTransactionLabel';
import networkConfig from 'constants/networkConfig';

import styles from './HistoryItemDetailsRest.module.scss';
import HistoryItemDetailsRestProps from './types';

const HistoryItemDetailsRest: FC<HistoryItemDetailsRestProps> = ({
  amount,
  type,
  timestamp,
  transactionHash,
  isFinalized = true,
  isWaitingForTransactionInitialized,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.historyItemModal',
  });
  const { data: transaction, isFetching: isFetchingTransaction } = useTransaction({
    hash: isWaitingForTransactionInitialized ? undefined : (transactionHash as `0x{string}`),
  });

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: type === 'withdrawal' ? 'ethereum' : 'golem',
        shouldIgnoreGwei: true,
        valueCrypto: amount,
      },
      label: t('sections.amount'),
    },
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        // Gas price is not known for pending transactions.
        isFetching: isFetchingTransaction || isWaitingForTransactionInitialized,
        shouldIgnoreGwei: true,
        valueCrypto: BigNumber.from(transaction ? transaction.gasPrice : 0),
      },
      label: t('sections.gasPrice'),
    },
    {
      childrenLeft: <HistoryTransactionLabel isFinalized={isFinalized} />,
      childrenRight: (
        <Button
          className={styles.viewOnEtherscan}
          href={`${networkConfig.etherscanAddress}/tx/${transactionHash}`}
          label={t('sections.viewOnEtherscan')}
          variant="link"
        />
      ),
    },
    {
      childrenRight: <HistoryItemDateAndTime timestamp={timestamp} />,
      label: t('sections.when'),
    },
  ];

  return (
    <BoxRounded alignment="left" hasSections isGrey isVertical>
      <Sections hasBottomDivider sections={sections} variant="small" />
    </BoxRounded>
  );
};

export default HistoryItemDetailsRest;
