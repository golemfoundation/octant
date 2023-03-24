import React, { FC, Fragment, useState } from 'react';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import DoubleValueContainer from 'components/core/DoubleValue/DoubleValueContainer';
import ModalGlmLock from 'components/dedicated/ModalGlmLock/ModalGlmLock';
import useDepositEffectiveAtCurrentEpoch from 'hooks/queries/useDepositEffectiveAtCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';

import BoxGlmLockProps from './types';

const BoxGlmLock: FC<BoxGlmLockProps> = ({ classNameBox }) => {
  const { isConnected } = useAccount();
  const [lockType, setLockType] = useState<'currentEpoch' | 'nextEpoch'>('nextEpoch');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
          onClick: () => setIsModalOpen(true),
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
          <DoubleValueContainer
            cryptoCurrency="golem"
            valueCrypto={depositEffectiveAtCurrentEpoch}
          />
        ) : (
          <DoubleValueContainer cryptoCurrency="golem" valueCrypto={depositsValue} />
        )}
      </BoxRounded>
      <ModalGlmLock
        modalProps={{
          isOpen: isModalOpen,
          onClosePanel: () => setIsModalOpen(false),
        }}
      />
    </Fragment>
  );
};

export default BoxGlmLock;
