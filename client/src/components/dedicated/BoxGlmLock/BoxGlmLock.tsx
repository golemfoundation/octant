import React, { FC, Fragment, useState } from 'react';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import ModalEffectiveLockedBalance from 'components/dedicated/ModalEffectiveLockedBalance/ModalEffectiveLockedBalance';
import ModalGlmLock from 'components/dedicated/ModalGlmLock/ModalGlmLock';
import useDepositEffectiveAtCurrentEpoch from 'hooks/queries/useDepositEffectiveAtCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';

import BoxGlmLockProps from './types';

const BoxGlmLock: FC<BoxGlmLockProps> = ({ classNameBox }) => {
  const { isConnected } = useAccount();
  const [isModalGlmLockOpen, setIsModalGlmLockOpen] = useState<boolean>(false);
  const [isModalEffectiveLockedBalanceOpen, setIsModalEffectiveLockedBalanceOpen] =
    useState<boolean>(false);
  const { data: depositEffectiveAtCurrentEpoch } = useDepositEffectiveAtCurrentEpoch();
  const { data: depositsValue } = useDepositValue();

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'golem',
        valueCrypto: depositsValue,
      },
      label: 'Current',
    },
    {
      doubleValueProps: {
        coinPricesServerDowntimeText: '...',
        cryptoCurrency: 'golem',
        valueCrypto: depositEffectiveAtCurrentEpoch,
      },
      label: 'Effective',
      onTooltipClick: () => setIsModalEffectiveLockedBalanceOpen(true),
    },
  ];

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
              : 'Edit Locked GLM',
          onClick: () => setIsModalGlmLockOpen(true),
          variant: 'cta',
        }}
        className={classNameBox}
        hasSections
        isVertical
        title="Locked balance"
      >
        <Sections sections={sections} />
      </BoxRounded>
      <ModalEffectiveLockedBalance
        modalProps={{
          isOpen: isModalEffectiveLockedBalanceOpen,
          onClosePanel: () => setIsModalEffectiveLockedBalanceOpen(false),
        }}
      />
      <ModalGlmLock
        modalProps={{
          isOpen: isModalGlmLockOpen,
          onClosePanel: () => setIsModalGlmLockOpen(false),
        }}
      />
    </Fragment>
  );
};

export default BoxGlmLock;
