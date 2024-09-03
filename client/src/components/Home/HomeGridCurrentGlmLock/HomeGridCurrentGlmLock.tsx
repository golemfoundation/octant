import _first from 'lodash/first';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import GridTile from 'components/shared/Grid/GridTile';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import Button from 'components/ui/Button';
import DoubleValue from 'components/ui/DoubleValue';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useEstimatedEffectiveDeposit from 'hooks/queries/useEstimatedEffectiveDeposit';
import useTransactionLocalStore from 'store/transactionLocal/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './HomeGridCurrentGlmLock.module.scss';
import ModalLockGlm from './ModalLockGlm';
import HomeGridCurrentGlmLockProps from './types';

const HomeGridCurrentGlmLock: FC<HomeGridCurrentGlmLockProps> = ({ className }) => {
  const { isConnected } = useAccount();
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridCurrentGlmLock',
  });
  const { data: currentEpoch } = useCurrentEpoch();
  const { isMobile } = useMediaQuery();
  const { isAppWaitingForTransactionToBeIndexed, transactionsPending } = useTransactionLocalStore(
    state => ({
      isAppWaitingForTransactionToBeIndexed: state.data.isAppWaitingForTransactionToBeIndexed,
      transactionsPending: state.data.transactionsPending,
    }),
  );

  const [isModalLockGlmOpen, setIsModalLockGlmOpen] = useState<boolean>(false);
  const { data: estimatedEffectiveDeposit, isFetching: isFetchingEstimatedEffectiveDeposit } =
    useEstimatedEffectiveDeposit();
  const { data: depositsValue, isFetching: isFetchingDepositValue } = useDepositValue();

  const isPreLaunch = getIsPreLaunch(currentEpoch);

  return (
    <>
      <GridTile className={className} title={t('currentGlmLock')}>
        <div className={styles.root}>
          <DoubleValue
            cryptoCurrency="golem"
            isFetching={
              isFetchingDepositValue ||
              (isAppWaitingForTransactionToBeIndexed &&
                _first(transactionsPending)?.type !== 'withdrawal')
            }
            showCryptoSuffix
            valueCrypto={depositsValue}
            variant={isMobile ? 'large' : 'extra-large'}
          />
          <div className={styles.divider} />
          <Sections
            hasBottomDivider
            sections={[
              {
                dataTest: 'HomeGridCurrentGlmLock__Section--effective',
                doubleValueProps: {
                  coinPricesServerDowntimeText: '...',
                  cryptoCurrency: 'golem',
                  dataTest: 'HomeGridCurrentGlmLock__Section--effective__DoubleValue',
                  isFetching:
                    isFetchingEstimatedEffectiveDeposit ||
                    (isAppWaitingForTransactionToBeIndexed &&
                      _first(transactionsPending)?.type !== 'withdrawal'),
                  showCryptoSuffix: true,
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
            ]}
            variant="standard"
          />
          <Button
            className={styles.lockGlmButton}
            isDisabled={!isConnected}
            isHigh
            onClick={() => setIsModalLockGlmOpen(true)}
            variant="cta"
          >
            {!depositsValue || (!!depositsValue && depositsValue === 0n)
              ? i18n.t('common.lockGlm')
              : t('editLockedGLM')}
          </Button>
        </div>
      </GridTile>
      <ModalLockGlm
        modalProps={{
          dataTest: 'ModalLockGlm',
          isOpen: isModalLockGlmOpen,
          onClosePanel: () => setIsModalLockGlmOpen(false),
        }}
      />
    </>
  );
};

export default HomeGridCurrentGlmLock;
