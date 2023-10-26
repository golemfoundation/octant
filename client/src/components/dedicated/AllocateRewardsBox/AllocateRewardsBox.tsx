import cx from 'classnames';
import { throttle } from 'lodash';
import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Loader from 'components/core/Loader/Loader';
import Slider from 'components/core/Slider/Slider';
import ModalAllocationValuesEdit from 'components/dedicated/ModalAllocationValuesEdit/ModalAllocationValuesEdit';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useAllocationsStore from 'store/allocations/store';
import getValueCryptoToDisplay from 'utils/getValueCryptoToDisplay';

import styles from './AllocateRewardsBox.module.scss';
import AllocateRewardsBoxProps from './types';

const AllocateRewardsBox: FC<AllocateRewardsBoxProps> = ({ className, isDisabled, onUnlock }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationRewardsBox',
  });
  const { data: individualReward } = useIndividualReward();
  const [modalMode, setModalMode] = useState<'closed' | 'donate' | 'withdraw'>('closed');
  const { rewardsForProposals, setRewardsForProposals } = useAllocationsStore(state => ({
    rewardsForProposals: state.data.rewardsForProposals,
    setRewardsForProposals: state.setRewardsForProposals,
  }));

  const onSetRewardsForProposals = (index: number) => {
    if (!individualReward || isDisabled) {
      return;
    }
    setRewardsForProposals(individualReward?.mul(index).div(100));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSetRewardsForProposalsThrottled = useCallback(
    throttle(onSetRewardsForProposals, 150),
    [],
  );

  if (!individualReward || individualReward.isZero()) {
    return (
      <BoxRounded
        className={cx(styles.root, className)}
        isVertical
        subtitle={t('subtitle', {
          individualReward: getValueCryptoToDisplay({
            cryptoCurrency: 'ethereum',
            valueCrypto: individualReward,
          }),
        })}
        title={t('title')}
      >
        <Loader />
      </BoxRounded>
    );
  }

  const percentRewardsForProposals = rewardsForProposals.mul(100).div(individualReward).toNumber();
  const percentWithdraw = 100 - percentRewardsForProposals;
  const rewardsForWithdraw = individualReward.sub(rewardsForProposals);
  const sections = [
    {
      header: t('donate', { percentRewardsForProposals }),
      value: getValueCryptoToDisplay({
        cryptoCurrency: 'ethereum',
        valueCrypto: rewardsForProposals,
      }),
    },
    {
      header: t('withdraw', { percentWithdraw }),
      value: getValueCryptoToDisplay({
        cryptoCurrency: 'ethereum',
        valueCrypto: rewardsForWithdraw,
      }),
    },
  ];

  return (
    <BoxRounded
      className={cx(styles.root, className)}
      isVertical
      subtitle={t('subtitle', {
        individualReward: getValueCryptoToDisplay({
          cryptoCurrency: 'ethereum',
          valueCrypto: individualReward,
        }),
      })}
      title={t('title')}
    >
      <Slider
        className={styles.slider}
        isDisabled={isDisabled}
        max={100}
        min={0}
        onChange={onSetRewardsForProposalsThrottled}
        onUnlock={onUnlock}
        value={percentRewardsForProposals}
      />
      <div className={styles.sections}>
        {sections.map(({ header, value }, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={cx(styles.section, isDisabled && styles.isDisabled)}
            onClick={() => (isDisabled ? {} : setModalMode(index === 0 ? 'donate' : 'withdraw'))}
          >
            <div>{header}</div>
            <div className={styles.value}>{value}</div>
          </div>
        ))}
      </div>
      <ModalAllocationValuesEdit
        modalProps={{
          header:
            modalMode === 'donate'
              ? t('donate', { percentRewardsForProposals })
              : t('withdraw', { percentWithdraw }),
          isOpen: modalMode !== 'closed',
          onClosePanel: () => setModalMode('closed'),
        }}
        onUpdateValue={newValue => {
          setRewardsForProposals(
            modalMode === 'donate' ? newValue : individualReward.sub(newValue),
          );
        }}
        valueCryptoSelected={modalMode === 'donate' ? rewardsForProposals : rewardsForWithdraw}
        valueCryptoTotal={individualReward}
      />
    </BoxRounded>
  );
};

export default AllocateRewardsBox;
