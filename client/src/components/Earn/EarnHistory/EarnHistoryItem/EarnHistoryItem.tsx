import React, { FC, Fragment, memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getHistoryItemDateAndTime } from 'components/Earn/EarnHistory/EarnHistoryItemDetails/EarnHistoryItemDateAndTime/utils';
import EarnHistoryItemDetailsModal from 'components/Earn/EarnHistory/EarnHistoryItemDetailsModal';
import EarnHistoryTransactionLabel from 'components/Earn/EarnHistory/EarnHistoryTransactionLabel';
import BoxRounded from 'components/ui/BoxRounded';
import DoubleValue from 'components/ui/DoubleValue';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useEpochTimestampHappenedIn from 'hooks/subgraph/useEpochTimestampHappenedIn';

import styles from './EarnHistoryItem.module.scss';
import EarnHistoryItemProps from './types';

const EarnHistoryItem: FC<EarnHistoryItemProps> = ({ isLast, ...rest }) => {
  const { type, amount, isFinalized = true, timestamp, isMultisig = false } = rest;
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.historyItem',
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: epochTimestampHappenedIn, isFetching: isFetchingEpochTimestampHappenedIn } =
    useEpochTimestampHappenedIn(rest.timestamp);
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
              <EarnHistoryTransactionLabel isFinalized={isFinalized} isMultisig={isMultisig} />
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
          textAlignment="right"
          valueCrypto={
            type === 'allocation' && isPersonalOnlyAllocation ? personalAllocationValue : amount
          }
          variant="tiny"
        />
      </BoxRounded>
      {!isLast && <div className={styles.separator} />}
      <EarnHistoryItemDetailsModal
        {...rest}
        modalProps={{
          isOpen: isModalOpen,
          onClosePanel: () => setIsModalOpen(false),
        }}
      />
    </Fragment>
  );
};

export default memo(EarnHistoryItem);
