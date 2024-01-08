import cx from 'classnames';
import { BigNumber } from 'ethers';
import throttle from 'lodash/throttle';
import React, { FC, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ModalAllocationValuesEdit from 'components/Allocation/ModalAllocationValuesEdit';
import BoxRounded from 'components/ui/BoxRounded';
import Slider from 'components/ui/Slider';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useAllocationsStore from 'store/allocations/store';
import getValueCryptoToDisplay from 'utils/getValueCryptoToDisplay';

import styles from './AllocationRewardsBox.module.scss';
import AllocationRewardsBoxProps from './types';

const AllocationRewardsBox: FC<AllocationRewardsBoxProps> = ({
  className,
  isDisabled,
  isManuallyEdited,
  isLocked,
  isError,
  setRewardsForProposalsCallback,
}) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationRewardsBox',
  });
  const { data: individualReward } = useIndividualReward();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const [modalMode, setModalMode] = useState<'closed' | 'donate' | 'withdraw'>('closed');
  const { rewardsForProposals, setRewardsForProposals } = useAllocationsStore(state => ({
    rewardsForProposals: state.data.rewardsForProposals,
    setRewardsForProposals: state.setRewardsForProposals,
  }));

  const hasUserIndividualReward = !!individualReward && !individualReward.isZero();
  const isDecisionWindowOpenAndHasIndividualReward =
    hasUserIndividualReward && isDecisionWindowOpen;

  const onSetRewardsForProposals = (rewardsForProposalsNew: BigNumber) => {
    if (!individualReward || isDisabled) {
      return;
    }
    setRewardsForProposals(rewardsForProposalsNew);
    setRewardsForProposalsCallback({ rewardsForProposalsNew });
  };

  const onUpdateValueModal = (newValue: BigNumber) => {
    const rewardsForProposalsNew =
      modalMode === 'donate' ? newValue : individualReward!.sub(newValue);
    onSetRewardsForProposals(rewardsForProposalsNew);
  };

  const onUpdateValueSlider = (index: number) => {
    if (!individualReward || isDisabled) {
      return;
    }
    const rewardsForProposalsNew = individualReward?.mul(index).div(100);
    onSetRewardsForProposals(rewardsForProposalsNew);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onUpdateValueSliderThrottled = useCallback(
    throttle(onUpdateValueSlider, 250, { trailing: true }),
    [isDisabled, individualReward?.toHexString(), setRewardsForProposalsCallback],
  );

  const percentRewardsForProposals = isDecisionWindowOpenAndHasIndividualReward
    ? rewardsForProposals.mul(100).div(individualReward).toNumber()
    : 50;
  const percentWithdraw = 100 - percentRewardsForProposals;
  const rewardsForProposalsFinal = isDecisionWindowOpenAndHasIndividualReward
    ? rewardsForProposals
    : BigNumber.from(0);
  const rewardsForWithdraw = isDecisionWindowOpenAndHasIndividualReward
    ? individualReward?.sub(rewardsForProposals)
    : BigNumber.from(0);
  const sections = [
    {
      header: isLocked ? t('donated') : t('donate'),
      value: getValueCryptoToDisplay({
        cryptoCurrency: 'ethereum',
        valueCrypto: rewardsForProposalsFinal,
      }),
    },
    {
      header: i18n.t('common.personal'),
      value: getValueCryptoToDisplay({
        cryptoCurrency: 'ethereum',
        valueCrypto: rewardsForWithdraw,
      }),
    },
  ];

  const subtitle = useMemo(() => {
    if (isLocked) {
      return t('allocated');
    }
    if (isDecisionWindowOpenAndHasIndividualReward) {
      return i18n.t('common.available');
    }
    return t('subtitleNoRewards');
  }, [isLocked, isDecisionWindowOpenAndHasIndividualReward, t, i18n]);

  return (
    <BoxRounded
      className={cx(styles.root, className)}
      hasPadding={false}
      isVertical
      subtitle={subtitle}
      title={getValueCryptoToDisplay({
        cryptoCurrency: 'ethereum',
        valueCrypto: individualReward,
      })}
      titleClassName={cx(styles.title, (isDisabled || isLocked) && styles.greyTitle)}
    >
      {!isDisabled && isManuallyEdited && <div className={styles.isManualBadge}>{t('manual')}</div>}
      <div className={cx(styles.sliderWrapper, isManuallyEdited && styles.isManuallyEdited)}>
        <Slider
          className={styles.slider}
          hideThumb={isLocked}
          isDisabled={isDisabled}
          isError={isError}
          max={100}
          min={0}
          onChange={onUpdateValueSliderThrottled}
          value={percentRewardsForProposals}
        />
      </div>
      <div className={styles.sections}>
        {sections.map(({ header, value }, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={cx(
              styles.section,
              isDisabled && styles.isDisabled,
              isLocked && styles.isLocked,
            )}
            onClick={() =>
              isLocked || isDisabled ? {} : setModalMode(index === 0 ? 'donate' : 'withdraw')
            }
          >
            <div className={styles.header}>{header}</div>
            <div className={cx(styles.value, (isLocked || isDisabled || isError) && styles.isDisabled)}>
              {value}
            </div>
          </div>
        ))}
      </div>
      <ModalAllocationValuesEdit
        modalProps={{
          header:
            modalMode === 'donate'
              ? t('donateWithPercentage', { percentage: percentRewardsForProposals })
              : t('personalWithPercentage', { percentage: percentWithdraw }),
          isOpen: modalMode !== 'closed',
          onClosePanel: () => setModalMode('closed'),
        }}
        onUpdateValue={newValue => onUpdateValueModal(newValue)}
        valueCryptoSelected={modalMode === 'donate' ? rewardsForProposals : rewardsForWithdraw}
        valueCryptoTotal={individualReward!}
      />
    </BoxRounded>
  );
};

export default AllocationRewardsBox;
