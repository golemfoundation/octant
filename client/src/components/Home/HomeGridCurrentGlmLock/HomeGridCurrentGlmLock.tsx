import _first from 'lodash/first';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import ModalLockGlm from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm';
import GridTile from 'components/shared/Grid/GridTile';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import Button from 'components/ui/Button';
import DoubleValue from 'components/ui/DoubleValue';
import { TOURGUIDE_ELEMENT_1 } from 'constants/domElementsIds';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useEstimatedEffectiveDeposit from 'hooks/queries/useEstimatedEffectiveDeposit';
import useUserSablierStreams from 'hooks/queries/useUserSablierStreams';
import useTransactionLocalStore from 'store/transactionLocal/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './HomeGridCurrentGlmLock.module.scss';
import RaffleWinnerBadge from './RaffleWinnerBadge';
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
  const { data: userSablierStreams, isFetching: isFetchinguserSablierStreams } =
    useUserSablierStreams();

  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const didUserWinAnyRaffles =
    !!userSablierStreams &&
    (userSablierStreams.sumAvailable > 0 ||
      (userSablierStreams.sablierStreams.some(({ isCancelled }) => isCancelled) &&
        userSablierStreams.sum > 0));

  const buttonText = useMemo(() => {
    if (userSablierStreams && userSablierStreams.sumAvailable > 0n) {
      return t('editLockedGLM');
    }
    if (!depositsValue || (!!depositsValue && depositsValue === 0n)) {
      return i18n.t('common.lockGlm');
    }
    return t('editLockedGLM');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositsValue, userSablierStreams?.sumAvailable]);

  return (
    <>
      <GridTile
        className={className}
        classNameTitleWrapper={didUserWinAnyRaffles ? styles.didUserWinAnyRaffles : ''}
        dataTest="HomeGridCurrentGlmLock"
        id={TOURGUIDE_ELEMENT_1}
        title={t('currentGlmLock')}
        titleSuffix={<RaffleWinnerBadge isVisible={didUserWinAnyRaffles} />}
      >
        <div className={styles.root}>
          <DoubleValue
            cryptoCurrency="golem"
            dataTest="HomeGridCurrentGlmLock--current"
            isFetching={
              isFetchingDepositValue ||
              isFetchinguserSablierStreams ||
              (isAppWaitingForTransactionToBeIndexed &&
                _first(transactionsPending)?.type !== 'withdrawal')
            }
            showCryptoSuffix
            valueCrypto={
              (depositsValue || 0n) +
              ((!userSablierStreams?.sablierStreams.some(({ isCancelled }) => isCancelled) &&
                userSablierStreams?.sumAvailable) ||
                0n)
            }
            variant={isMobile ? 'large' : 'extra-large'}
          />
          <div className={styles.divider} />
          <Sections
            hasBottomDivider
            sections={[
              {
                className: styles.effective,
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
                },
              },
            ]}
            variant="standard"
          />
          <Button
            className={styles.button}
            dataTest="HomeGridCurrentGlmLock__Button"
            isDisabled={!isConnected}
            isHigh
            onClick={() => setIsModalLockGlmOpen(true)}
            variant="cta"
          >
            {buttonText}
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
