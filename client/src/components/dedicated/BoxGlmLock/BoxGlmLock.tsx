import React, { FC, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import ModalGlmLock from 'components/dedicated/ModalGlmLock/ModalGlmLock';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDepositEffectiveAtCurrentEpoch from 'hooks/queries/useDepositEffectiveAtCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useMetaStore from 'store/meta/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import BoxGlmLockProps from './types';

const BoxGlmLock: FC<BoxGlmLockProps> = ({ classNameBox }) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.boxGlmLock',
  });
  const { isConnected } = useAccount();
  const { isAppWaitingForTransactionToBeIndexed } = useMetaStore(state => ({
    isAppWaitingForTransactionToBeIndexed: state.data.isAppWaitingForTransactionToBeIndexed,
  }));

  const [isModalGlmLockOpen, setIsModalGlmLockOpen] = useState<boolean>(false);
  const {
    data: depositEffectiveAtCurrentEpoch,
    isFetching: isFetchingDepositEffectiveAtCurrentEpoch,
  } = useDepositEffectiveAtCurrentEpoch();
  const { data: depositsValue, isFetching: isFetchingDepositValue } = useDepositValue();
  const { data: currentEpoch } = useCurrentEpoch();

  const isPreLaunch = getIsPreLaunch(currentEpoch);

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'golem',
        isFetching: isFetchingDepositValue || isAppWaitingForTransactionToBeIndexed,
        valueCrypto: depositsValue,
      },
      isDisabled: isPreLaunch && !isConnected,
      label: t('current'),
    },
    {
      dataTest: 'BoxGlmLock__Section--effective',
      doubleValueProps: {
        coinPricesServerDowntimeText: '...',
        cryptoCurrency: 'golem',
        isFetching:
          isFetchingDepositEffectiveAtCurrentEpoch || isAppWaitingForTransactionToBeIndexed,
        valueCrypto: depositEffectiveAtCurrentEpoch,
      },
      isDisabled: isPreLaunch && !isConnected,
      label: t('effective'),
      tooltipProps: {
        dataTest: 'TooltipEffectiveLockedBalance',
        position: 'bottom-right',
        text: t('tooltipText'),
      },
    },
  ];

  return (
    <Fragment>
      <BoxRounded
        alignment="left"
        buttonProps={{
          dataTest: 'BoxGlmLock__Button',
          isDisabled: !isConnected || isPreLaunch,
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
