import { formatUnits } from 'ethers/lib/utils';
import React, { FC, Fragment, useState } from 'react';
import { useMetamask } from 'use-metamask';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import GlmStakingFlow from 'components/dedicated/GlmStakingFlow/GlmStakingFlow';
import useDepositEffectiveAtCurrentEpoch from 'hooks/queries/useDepositEffectiveAtCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';

import UserGlmLockProps from './types';

const UserGlmLock: FC<UserGlmLockProps> = ({ classNameBox }) => {
  const {
    metaState: { isConnected },
  } = useMetamask();
  const [lockType, setLockType] = useState<'currentEpoch' | 'nextEpoch'>('nextEpoch');
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
              ? 'Lock GLM'
              : 'Edit GLM Lock',
          onClick: () => setIsGlmStakingModalOpen(true),
          variant: 'cta',
        }}
        className={classNameBox}
        tabs={[
          {
            isActive: lockType === 'currentEpoch',
            onClick: () => setLockType('currentEpoch'),
            title: 'Current Epoch Lock',
          },
          {
            isActive: lockType === 'nextEpoch',
            onClick: () => setLockType('nextEpoch'),
            title: 'Next Epoch Lock',
          },
        ]}
      >
        {lockType === 'currentEpoch' ? (
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

export default UserGlmLock;
