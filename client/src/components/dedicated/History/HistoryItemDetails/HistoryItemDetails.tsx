import format from 'date-fns/format';
import { BigNumber } from 'ethers';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransaction } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import Button from 'components/core/Button/Button';
import HistoryTransactionLabel from 'components/dedicated/History/HistoryTransactionLabel/HistoryTransactionLabel';
import networkConfig from 'constants/networkConfig';

import styles from './HistoryItemDetails.module.scss';
import HistoryItemDetailsModalProps from './types';

const HistoryItemDetails: FC<HistoryItemDetailsModalProps> = ({
  amount,
  type,
  timestamp,
  transactionHash,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.historyItemModal',
  });
  const { data: transaction, isFetching: isFetchingTransaction } = useTransaction({
    hash: transactionHash as `0x{string}`,
  });

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: type === 'withdrawal' ? 'ethereum' : 'golem',
        valueCrypto: amount,
      },
      label: t('sections.amount'),
    },
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: isFetchingTransaction,
        valueCrypto: BigNumber.from(transaction ? transaction.gasPrice : 0),
      },
      label: t('sections.gasPrice'),
    },
    {
      childrenLeft: <HistoryTransactionLabel type="confirmed" />,
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
      childrenRight: (
        <div className={styles.text}>
          {format(parseInt(timestamp, 10) / 1000, 'K:mbbb, dd MMM yyyy')}
        </div>
      ),
      label: t('sections.when'),
    },
  ];

  return (
    <BoxRounded alignment="left" hasSections isGrey isVertical>
      <Sections hasBottomDivider sections={sections} />
    </BoxRounded>
  );
};

export default HistoryItemDetails;
