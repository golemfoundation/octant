import cx from 'classnames';
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
  setRewardsForProjectsCallback,
}) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationRewardsBox',
  });
  const { data: individualReward } = useIndividualReward();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const [modalMode, setModalMode] = useState<'closed' | 'donate' | 'withdraw'>('closed');
  const { rewardsForProjects, setRewardsForProjects } = useAllocationsStore(state => ({
    rewardsForProjects: state.data.rewardsForProjects,
    setRewardsForProjects: state.setRewardsForProjects,
  }));

  const hasUserIndividualReward = !!individualReward && individualReward !== 0n;
  const isDecisionWindowOpenAndHasIndividualReward =
    hasUserIndividualReward && isDecisionWindowOpen;

  const onSetRewardsForProjects = (rewardsForProjectsNew: bigint) => {
    if (!individualReward || isDisabled) {
      return;
    }
    setRewardsForProjects(rewardsForProjectsNew);
    setRewardsForProjectsCallback({ rewardsForProjectsNew });
  };

  const onUpdateValueModal = (newValue: bigint) => {
    const rewardsForProjectsNew = modalMode === 'donate' ? newValue : individualReward! - newValue;
    onSetRewardsForProjects(rewardsForProjectsNew);
  };

  const onUpdateValueSlider = (index: number) => {
    if (!individualReward || isDisabled) {
      return;
    }
    const rewardsForProjectsNew = (individualReward * BigInt(index)) / BigInt(100);
    onSetRewardsForProjects(rewardsForProjectsNew);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onUpdateValueSliderThrottled = useCallback(
    throttle(onUpdateValueSlider, 250, { trailing: true }),
    [isDisabled, individualReward, setRewardsForProjectsCallback],
  );

  const percentRewardsForProjects = isDecisionWindowOpenAndHasIndividualReward
    ? Number((rewardsForProjects * BigInt(100)) / individualReward)
    : 50;
  const percentWithdraw = 100 - percentRewardsForProjects;
  const rewardsForProjectsFinal = isDecisionWindowOpenAndHasIndividualReward
    ? rewardsForProjects
    : BigInt(0);
  const rewardsForWithdraw = isDecisionWindowOpenAndHasIndividualReward
    ? individualReward - rewardsForProjects
    : BigInt(0);
  const sections = [
    {
      header: isLocked ? t('donated') : t('donate'),
      value: getValueCryptoToDisplay({
        cryptoCurrency: 'ethereum',
        valueCrypto: rewardsForProjectsFinal,
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
      return i18n.t('common.availableNow');
    }
    return t('subtitleNoRewards');
  }, [isLocked, isDecisionWindowOpenAndHasIndividualReward, t, i18n]);

  return (
    <BoxRounded
      className={cx(styles.root, className)}
      hasPadding={false}
      isVertical
      subtitle={subtitle}
      subtitleClassName={styles.subtitle}
      title={getValueCryptoToDisplay({
        cryptoCurrency: 'ethereum',
        valueCrypto: isDecisionWindowOpen ? individualReward : BigInt(0),
      })}
      titleClassName={cx(styles.title, (isDisabled || isLocked) && styles.greyTitle)}
    >
      {!isDisabled && isManuallyEdited && <div className={styles.isManualBadge}>{t('manual')}</div>}
      <div
        className={cx(
          styles.sliderWrapper,
          isDecisionWindowOpen && isManuallyEdited && styles.isManuallyEdited,
        )}
      >
        <Slider
          className={styles.slider}
          hideThumb={isLocked}
          isDisabled={isDisabled}
          isError={isError}
          max={100}
          min={0}
          onChange={onUpdateValueSliderThrottled}
          value={percentRewardsForProjects}
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
            <div className={cx(styles.value, (isLocked || isDisabled || isError) && styles.isGrey)}>
              {value}
            </div>
          </div>
        ))}
      </div>
      <ModalAllocationValuesEdit
        modalProps={{
          header:
            modalMode === 'donate'
              ? t('donateWithPercentage', { percentage: percentRewardsForProjects })
              : t('personalWithPercentage', { percentage: percentWithdraw }),
          isOpen: modalMode !== 'closed',
          onClosePanel: () => setModalMode('closed'),
        }}
        onUpdateValue={newValue => onUpdateValueModal(newValue)}
        valueCryptoSelected={modalMode === 'donate' ? rewardsForProjects : rewardsForWithdraw}
        valueCryptoTotal={individualReward!}
      />
    </BoxRounded>
  );
};

export default AllocationRewardsBox;
