import { BigNumber } from 'ethers';
import React, { FC, Fragment, memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import EarnHistoryItemDetailsModal from 'components/Earn/EarnHistory/EarnHistoryItemDetailsModal';
import EarnHistoryTransactionLabel from 'components/Earn/EarnHistory/EarnHistoryTransactionLabel';
import BoxRounded from 'components/ui/BoxRounded';
import DoubleValue from 'components/ui/DoubleValue';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useEpochTimestampHappenedIn from 'hooks/subgraph/useEpochTimestampHappenedIn';

import styles from './EarnHistoryItem.module.scss';
import EarnHistoryItemProps from './types';

const EarnHistoryItem: FC<EarnHistoryItemProps> = props => {
  const { type, amount, isFinalized = true } = props;
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.historyItem',
  });
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
  }, [i18n, isPersonalOnlyAllocation, t, type]);

  return (
    <Fragment>
      <BoxRounded className={styles.box} hasPadding={false} onClick={() => setIsModalOpen(true)}>
        <div className={styles.titleAndSubtitle}>
          <div className={styles.title}>{title}</div>
          {type !== 'allocation' && <EarnHistoryTransactionLabel isFinalized={isFinalized} />}
        </div>
        <DoubleValue
          className={styles.values}
          cryptoCurrency={['allocation', 'withdrawal'].includes(type) ? 'ethereum' : 'golem'}
          isFetching={isFetchingEpochTimestampHappenedIn || isFetchingIndividualReward}
          textAlignment="right"
          valueCrypto={
            type === 'allocation' && isPersonalOnlyAllocation ? personalAllocationValue : amount
          }
          variant="tiny"
        />
      </BoxRounded>
      <EarnHistoryItemDetailsModal
        {...props}
        modalProps={{
          isOpen: isModalOpen,
          onClosePanel: () => setIsModalOpen(false),
        }}
      />
    </Fragment>
  );
};

export default memo(EarnHistoryItem);
