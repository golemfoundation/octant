import React, { FC, Fragment, memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ModalTransactionDetails from 'components/Home/HomeGridTransactions/ModalTransactionDetails';
import { getHistoryItemDateAndTime } from 'components/Home/HomeGridTransactions/ModalTransactionDetails/TransactionDetails/TransactionDetailsDateAndTime/utils';
import TransactionLabel from 'components/Home/HomeGridTransactions/TransactionLabel';
import BoxRounded from 'components/ui/BoxRounded';
import DoubleValue from 'components/ui/DoubleValue';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useEpochTimestampHappenedIn from 'hooks/subgraph/useEpochTimestampHappenedIn';

import styles from './TransactionsListItem.module.scss';
import TransactionsListItemProps from './types';

const TransactionsListItem: FC<TransactionsListItemProps> = ({ ...props }) => {
  const { type, eventData, isFinalized = true, timestamp, isMultisig = false } = props;
  const { amount } = eventData;
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridTransactions.transactionsListItem',
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: epochTimestampHappenedIn, isFetching: isFetchingEpochTimestampHappenedIn } =
    useEpochTimestampHappenedIn(timestamp);
  const allocationEpoch = epochTimestampHappenedIn ? epochTimestampHappenedIn - 1 : undefined;
  const { data: individualReward, isFetching: isFetchingIndividualReward } =
    useIndividualReward(allocationEpoch);

  const personalAllocationValue = individualReward ? individualReward - amount : BigInt(0);
  const isPersonalOnlyAllocation = amount === 0n;

  const title = useMemo(() => {
    switch (type) {
      case 'patron_mode_donation':
        // Donation happened in epoch N, but affects epoch N - 1.
        return t('epochDonation', {
          epoch: epochTimestampHappenedIn ? epochTimestampHappenedIn - 1 : '',
        });
      case 'allocation':
        return isPersonalOnlyAllocation
          ? i18n.t('common.personalAllocation')
          : t('allocatedRewards');
      case 'lock':
        return t('lockedGLM');
      case 'unlock':
        return t('unlockedGLM');
      default:
        return t('withdrawnFunds');
    }
  }, [i18n, isPersonalOnlyAllocation, t, type, epochTimestampHappenedIn]);

  return (
    <Fragment>
      <BoxRounded
        childrenWrapperClassName={styles.child}
        className={styles.box}
        dataTest="HistoryItem"
        hasPadding={false}
        onClick={() => setIsModalOpen(true)}
      >
        <div className={styles.titleAndSubtitle}>
          <div className={styles.title} data-test="HistoryItem__title">
            {title}
          </div>
          {type === 'patron_mode_donation' ? (
            <div className={styles.patronDonationTimestamp}>
              {getHistoryItemDateAndTime(timestamp)}
            </div>
          ) : (
            type !== 'allocation' && (
              <TransactionLabel isFinalized={isFinalized} isMultisig={isMultisig} />
            )
          )}
        </div>
        <DoubleValue
          className={styles.values}
          cryptoCurrency={
            ['allocation', 'withdrawal', 'patron_mode_donation'].includes(type)
              ? 'ethereum'
              : 'golem'
          }
          dataTest="HistoryItem__DoubleValue"
          isFetching={isFetchingEpochTimestampHappenedIn || isFetchingIndividualReward}
          showCryptoSuffix
          textAlignment="right"
          valueCrypto={
            type === 'allocation' && isPersonalOnlyAllocation ? personalAllocationValue : amount
          }
          variant="tiny"
        />
      </BoxRounded>
      <ModalTransactionDetails
        {...props}
        modalProps={{
          isOpen: isModalOpen,
          onClosePanel: () => setIsModalOpen(false),
        }}
      />
    </Fragment>
  );
};

export default memo(TransactionsListItem);
