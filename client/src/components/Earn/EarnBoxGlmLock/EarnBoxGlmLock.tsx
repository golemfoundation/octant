import React, { FC, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import ModalEarnGlmLock from 'components/Earn/ModalEarnGlmLock/ModalEarnGlmLock';
import ModalEarnRewardsCalculator from 'components/Earn/ModalEarnRewardsCalculator';
import BoxRounded from 'components/ui/BoxRounded';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/ui/BoxRounded/Sections/types';
import Svg from 'components/ui/Svg';
import Tooltip from 'components/ui/Tooltip';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useEstimatedEffectiveDeposit from 'hooks/queries/useEstimatedEffectiveDeposit';
import useTransactionLocalStore from 'store/transactionLocal/store';
import { calculator } from 'svg/misc';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './EarnBoxGlmLock.module.scss';
import EarnBoxGlmLockProps from './types';

const EarnBoxGlmLock: FC<EarnBoxGlmLockProps> = ({ classNameBox }) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.boxGlmLock',
  });
  const { isConnected } = useAccount();
  const { isAppWaitingForTransactionToBeIndexed } = useTransactionLocalStore(state => ({
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
      dataTest: 'BoxGlmLock__Section--current',
      doubleValueProps: {
        cryptoCurrency: 'golem',
        dataTest: 'BoxGlmLock__Section--current__DoubleValue',
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
        tooltipClassName: styles.effectiveTooltip,
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
            !depositsValue || (!!depositsValue && depositsValue === 0n)
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
            dataTest="Tooltip__rewardsCalculator"
            shouldShowOnClickMobile={false}
            text={i18n.t('common.calculateRewards')}
            tooltipClassName={styles.tooltip}
            variant="small"
          >
            <div
              className={styles.calculateRewards}
              data-test="Tooltip__rewardsCalculator__body"
              onClick={() => setIsModalRewardsCalculatorOpen(true)}
            >
              <Svg img={calculator} size={2.4} />
            </div>
          </Tooltip>
        }
      >
        <Sections sections={sections} />
      </BoxRounded>
      <ModalEarnGlmLock
        modalProps={{
          dataTest: 'ModalGlmLock',
          isOpen: isModalGlmLockOpen,
          onClosePanel: () => setIsModalGlmLockOpen(false),
        }}
      />
      <ModalEarnRewardsCalculator
        modalProps={{
          isOpen: isModalRewardsCalculatorOpen,
          onClosePanel: () => setIsModalRewardsCalculatorOpen(false),
        }}
      />
    </Fragment>
  );
};

export default EarnBoxGlmLock;
