import React, { FC, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import Svg from 'components/core/Svg/Svg';
import Tooltip from 'components/core/Tooltip/Tooltip';
import ModalGlmLock from 'components/dedicated/ModalGlmLock/ModalGlmLock';
import ModalRewardsCalculator from 'components/dedicated/ModalRewardsCalculator/ModalRewardsCalculator';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useEstimatedEffectiveDeposit from 'hooks/queries/useEstimatedEffectiveDeposit';
import useMetaStore from 'store/meta/store';
import { calculator } from 'svg/misc';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './BoxGlmLock.module.scss';
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
  const { data: estimatedEffectiveDeposit, isFetching: isFetchingEstimatedEffectiveDeposit } =
    useEstimatedEffectiveDeposit();
  const [isModalRewardsCalculatorOpen, setIsModalRewardsCalculatorOpen] = useState(false);
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
        dataTest: 'BoxGlmLock__Section--effective__DoubleValue',
        isFetching: isFetchingEstimatedEffectiveDeposit || isAppWaitingForTransactionToBeIndexed,
        valueCrypto: estimatedEffectiveDeposit,
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
        titleSuffix={
          <Tooltip
            text={i18n.t('common.calculateRewards')}
            tooltipClassName={styles.tooltip}
            variant="small"
          >
            <div
              className={styles.calculateRewards}
              onClick={() => setIsModalRewardsCalculatorOpen(true)}
            >
              <Svg img={calculator} size={2.4} />
            </div>
          </Tooltip>
        }
      >
        <Sections sections={sections} />
      </BoxRounded>
      <ModalGlmLock
        modalProps={{
          isOpen: isModalGlmLockOpen,
          onClosePanel: () => setIsModalGlmLockOpen(false),
        }}
      />
      <ModalRewardsCalculator
        modalProps={{
          isOpen: isModalRewardsCalculatorOpen,
          onClosePanel: () => setIsModalRewardsCalculatorOpen(false),
        }}
      />
    </Fragment>
  );
};

export default BoxGlmLock;
