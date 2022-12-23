import { useMetamask } from 'use-metamask';
import React, { ReactElement, useState } from 'react';

import BoxRounded from 'components/core/box-rounded/box-rounded.component';
import DoubleValue from 'components/core/double-value/double-value.component';
import GlmStakingFlow from 'components/dedicated/glm-staking-flow/glm-staking-flow.component';
import MainLayout from 'layouts/main-layout/main.layout';
import useDepositEffectiveAtCurrentEpoch from 'hooks/useDepositEffectiveAtCurrentEpoch';
import useDepositValue from 'hooks/useDepositValue';
import useRewardBudget from 'hooks/useRewardBudget';

import { getCurrentEpochStateText } from './utils';
import styles from './style.module.scss';

const EarnView = (): ReactElement => {
  const {
    metaState: { isConnected },
  } = useMetamask();
  const [stakeView, setStakeView] = useState<'currentEpoch' | 'nextEpoch'>('nextEpoch');
  const [isGlmStakingModalOpen, setIsGlmStakingModalOpen] = useState<boolean>(false);
  const { data: depositsValue } = useDepositValue();
  const { data: rewardBudget } = useRewardBudget();
  const { data: depositEffectiveAtCurrentEpoch } = useDepositEffectiveAtCurrentEpoch();

  return (
    <MainLayout>
      <BoxRounded
        alignment="left"
        buttonProps={{
          isDisabled: !isConnected,
          isHigh: true,
          label: 'Edit GLM Stake',
          onClick: () => setIsGlmStakingModalOpen(true),
          variant: 'cta',
        }}
        className={styles.box}
        tabs={[
          {
            isActive: stakeView === 'currentEpoch',
            onClick: () => setStakeView('currentEpoch'),
            title: 'Current Epoch Stake',
          },
          {
            isActive: stakeView === 'nextEpoch',
            onClick: () => setStakeView('nextEpoch'),
            title: 'Next Epoch Stake',
          },
        ]}
      >
        {stakeView === 'currentEpoch' ? (
          <DoubleValue
            mainValue={getCurrentEpochStateText({
              suffix: 'GLM',
              value: depositEffectiveAtCurrentEpoch,
            })}
          />
        ) : (
          <DoubleValue
            mainValue={getCurrentEpochStateText({ suffix: 'GLM', value: depositsValue })}
          />
        )}
      </BoxRounded>
      <BoxRounded
        alignment="left"
        buttonProps={{
          isDisabled: true,
          isHigh: true,
          label: 'Withdraw ETH Rewards',
          variant: 'cta',
        }}
        className={styles.box}
        isVertical
        title="Rewards Balance"
      >
        <DoubleValue mainValue={getCurrentEpochStateText({ suffix: 'ETH', value: rewardBudget })} />
      </BoxRounded>
      <GlmStakingFlow
        modalProps={{
          header: 'Stake GLM',
          isOpen: isGlmStakingModalOpen,
          onClosePanel: () => setIsGlmStakingModalOpen(false),
        }}
      />
    </MainLayout>
  );
};

export default EarnView;
