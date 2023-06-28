import React, { FC, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import ModalEffectiveLockedBalance from 'components/dedicated/ModalEffectiveLockedBalance/ModalEffectiveLockedBalance';
import ModalGlmLock from 'components/dedicated/ModalGlmLock/ModalGlmLock';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDepositEffectiveAtCurrentEpoch from 'hooks/queries/useDepositEffectiveAtCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';

import BoxGlmLockProps from './types';

const BoxGlmLock: FC<BoxGlmLockProps> = ({ classNameBox }) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.boxGlmLock',
  });
  const { isConnected } = useAccount();
  const [isModalGlmLockOpen, setIsModalGlmLockOpen] = useState<boolean>(false);
  const [isModalEffectiveLockedBalanceOpen, setIsModalEffectiveLockedBalanceOpen] =
    useState<boolean>(false);
  const { data: depositEffectiveAtCurrentEpoch } = useDepositEffectiveAtCurrentEpoch();
  const { data: depositsValue } = useDepositValue();
  const { data: currentEpoch } = useCurrentEpoch();

  const isEpoch1 = currentEpoch === 1;

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'golem',
        valueCrypto: depositsValue,
      },
      isDisabled: isEpoch1 && !isConnected,
      label: t('current'),
    },
    {
      dataTest: 'BoxGlmLock__Section--effective',
      doubleValueProps: {
        coinPricesServerDowntimeText: '...',
        cryptoCurrency: 'golem',
        valueCrypto: depositEffectiveAtCurrentEpoch,
      },
      isDisabled: isEpoch1 && !isConnected,
      label: t('effective'),
      onTooltipClick: () => setIsModalEffectiveLockedBalanceOpen(true),
    },
  ];

  return (
    <Fragment>
      <BoxRounded
        alignment="left"
        buttonProps={{
          dataTest: 'BoxGlmLock__Button',
          isDisabled: !isConnected,
          isHigh: true,
          label:
            !depositsValue || (!!depositsValue && depositsValue.isZero())
              ? i18n.t('common.lockGlm')
              : t('editLockedGLM'),
          onClick: () => setIsModalGlmLockOpen(true),
          variant: 'cta',
        }}
        className={classNameBox}
        dataTest="BoxGlmLock__BoxRounded"
        hasSections
        isVertical
        title={t('lockedBalance')}
      >
        <Sections sections={sections} />
      </BoxRounded>
      <ModalEffectiveLockedBalance
        modalProps={{
          dataTest: 'ModalEffectiveLockedBalance',
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
