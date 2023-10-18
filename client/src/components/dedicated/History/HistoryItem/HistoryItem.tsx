import { BigNumber } from 'ethers';
import React, { FC, Fragment, memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import HistoryItemDetailsModal from 'components/dedicated/History/HistoryItemDetailsModal/HistoryItemDetailsModal';
import HistoryTransactionLabel from 'components/dedicated/History/HistoryTransactionLabel/HistoryTransactionLabel';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useEpochTimestampHappenedIn from 'hooks/subgraph/useEpochTimestampHappenedIn';

import styles from './HistoryItem.module.scss';
import HistoryItemProps from './types';

const HistoryItem: FC<HistoryItemProps> = props => {
  const { type, amount, isFinalized = true } = props;
  const { t } = useTranslation('translation', { keyPrefix: 'components.dedicated.historyItem' });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: epochTimestampHappenedIn, isFetching: isFetchingEpochTimestampHappenedIn } =
    useEpochTimestampHappenedIn(props.timestamp);
  const allocationEpoch = epochTimestampHappenedIn ? epochTimestampHappenedIn - 1 : undefined;
  const { data: individualReward, isFetching: isFetchingIndividualReward } =
    useIndividualReward(allocationEpoch);

  const personalAllocationValue = individualReward
    ? individualReward.sub(amount)
    : BigNumber.from(0);
  const isPersonalOnlyAllocation = amount.isZero();

  const title = useMemo(() => {
    switch (type) {
      case 'allocation':
        return t(isPersonalOnlyAllocation ? 'personalAllocation' : 'allocatedRewards');
      case 'lock':
        return t('lockedGLM');
      case 'unlock':
        return t('unlockedGLM');
      default:
        return t('withdrawnFunds');
    }
  }, [isPersonalOnlyAllocation, t, type]);

  return (
    <Fragment>
      <BoxRounded className={styles.box} hasPadding={false} onClick={() => setIsModalOpen(true)}>
        <div className={styles.titleAndSubtitle}>
          <div className={styles.title}>{title}</div>
          {type !== 'allocation' && <HistoryTransactionLabel isFinalized={isFinalized} />}
        </div>
        <DoubleValue
          className={styles.values}
          cryptoCurrency={['allocation', 'withdrawal'].includes(type) ? 'ethereum' : 'golem'}
          isFetching={isFetchingEpochTimestampHappenedIn || isFetchingIndividualReward}
          valueCrypto={isPersonalOnlyAllocation ? amount : personalAllocationValue}
          variant="tiny"
        />
      </BoxRounded>
      <HistoryItemDetailsModal
        {...props}
        modalProps={{
          isOpen: isModalOpen,
          onClosePanel: () => setIsModalOpen(false),
        }}
      />
    </Fragment>
  );
};

export default memo(HistoryItem);
