import { formatUnits } from 'ethers/lib/utils';
import React, { FC, Fragment, useState } from 'react';
import { useMetamask } from 'use-metamask';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import GlmStakingFlow from 'components/dedicated/GlmStakingFlow/GlmStakingFlow';
import useDepositEffectiveAtCurrentEpoch from 'hooks/useDepositEffectiveAtCurrentEpoch';
import useDepositValue from 'hooks/useDepositValue';

import UserGlmStakeProps from './types';

const UserGlmStake: FC<UserGlmStakeProps> = ({ classNameBox }) => {
  const {
    metaState: { isConnected },
  } = useMetamask();
  const [stakeView, setStakeView] = useState<'currentEpoch' | 'nextEpoch'>('nextEpoch');
  const [isGlmStakingModalOpen, setIsGlmStakingModalOpen] = useState<boolean>(false);
  const { data: depositEffectiveAtCurrentEpoch } = useDepositEffectiveAtCurrentEpoch();
  const { data: depositsValue } = useDepositValue();

  return (
    <Fragment>
      <BoxRounded
        alignment="left"
        buttonProps={{
          isDisabled: !isConnected,
          isHigh: true,
          label:
            !depositsValue || (!!depositsValue && depositsValue.isZero())
              ? 'Stake GLM'
              : 'Edit GLM Stake',
          onClick: () => setIsGlmStakingModalOpen(true),
          variant: 'cta',
        }}
        className={classNameBox}
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
            mainValue={`${
              depositEffectiveAtCurrentEpoch ? formatUnits(depositEffectiveAtCurrentEpoch) : '0.0'
            } GLM`}
          />
        ) : (
          <DoubleValue mainValue={`${depositsValue ? formatUnits(depositsValue) : '0.0'} GLM`} />
        )}
      </BoxRounded>
      <GlmStakingFlow
        modalProps={{
          isOpen: isGlmStakingModalOpen,
          onClosePanel: () => setIsGlmStakingModalOpen(false),
        }}
      />
    </Fragment>
  );
};

export default UserGlmStake;
