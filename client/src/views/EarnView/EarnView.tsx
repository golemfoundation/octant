import cx from 'classnames';
import React, { ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import BoxGlmLock from 'components/dedicated/BoxGlmLock/BoxGlmLock';
import BoxPersonalAllocation from 'components/dedicated/BoxPersonalAllocation/BoxPersonalAllocation';
import History from 'components/dedicated/History/History';
import TimeCounter from 'components/dedicated/TimeCounter/TimeCounter';
import TipTile from 'components/dedicated/TipTile/TipTile';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useWithdrawableUserEth from 'hooks/queries/useWithdrawableUserEth';
import MainLayout from 'layouts/MainLayout/MainLayout';
import useTipsStore from 'store/tips/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './EarnView.module.scss';

const EarnView = (): ReactElement => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'views.earn',
  });
  const [isPollingForCurrentEpoch, setIsPollingForCurrentEpoch] = useState<boolean>(false);
  const { isDesktop } = useMediaQuery();
  const { isConnected } = useAccount();
  const { data: withdrawableUserEth } = useWithdrawableUserEth();
  const { wasWithdrawAlreadyClosed, setWasWithdrawAlreadyClosed } = useTipsStore(state => ({
    setWasWithdrawAlreadyClosed: state.setWasWithdrawAlreadyClosed,
    wasWithdrawAlreadyClosed: state.data.wasWithdrawAlreadyClosed,
  }));
  const { data: currentEpoch } = useCurrentEpoch({
    refetchInterval: isPollingForCurrentEpoch ? 5000 : false,
  });
  const { wasConnectWalletAlreadyClosed, setWasConnectWalletAlreadyClosed } = useTipsStore(
    state => ({
      setWasConnectWalletAlreadyClosed: state.setWasConnectWalletAlreadyClosed,
      wasConnectWalletAlreadyClosed: state.data.wasConnectWalletAlreadyClosed,
    }),
  );

  useEffect(() => {
    // When Epoch 0 ends, we poll for Epoch 1 from the backend.
    if (isPollingForCurrentEpoch && currentEpoch === 1) {
      setIsPollingForCurrentEpoch(false);
    }
  }, [isPollingForCurrentEpoch, currentEpoch, setIsPollingForCurrentEpoch]);

  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const isConnectWalletTipVisible = !isConnected && !wasConnectWalletAlreadyClosed;
  const isWithdrawTipVisible =
    !!currentEpoch &&
    currentEpoch > 1 &&
    !!withdrawableUserEth &&
    !withdrawableUserEth.isZero() &&
    !wasWithdrawAlreadyClosed;

  const preLaunchStartTimestamp = Date.UTC(2023, 7, 4, 10, 0, 0, 0); // 04.08.2023 12:00 CEST
  const preLaunchEndTimestamp = Date.UTC(2023, 7, 8, 16, 0, 0, 0); // 08.08.2023 18:00 CEST
  const duration = preLaunchEndTimestamp - preLaunchStartTimestamp;

  return (
    <MainLayout classNameBody={styles.layoutBody} dataTest="EarnView">
      <TipTile
        dataTest="EarnView__TipTile--connectWallet"
        image="images/tip-connect-wallet.webp"
        infoLabel={i18n.t('common.gettingStarted')}
        isOpen={isConnectWalletTipVisible}
        onClose={() => setWasConnectWalletAlreadyClosed(true)}
        text={t('tips.connectWallet.text')}
        title={t(
          isDesktop ? 'tips.connectWallet.title.desktop' : 'tips.connectWallet.title.mobile',
        )}
      />
      <TipTile
        className={styles.tip}
        image="images/tip-withdraw.webp"
        infoLabel={i18n.t('common.gettingStarted')}
        isOpen={isWithdrawTipVisible}
        onClose={() => setWasWithdrawAlreadyClosed(true)}
        text={t('tips.withdrawEth.text')}
        title={t('tips.withdrawEth.title')}
      />
      <div className={styles.wrapper}>
        <div className={cx(styles.boxesWrapper, styles.column)}>
          {isPreLaunch && (
            <BoxRounded className={styles.box} isVertical title={t('preLaunch.timerTitle')}>
              <TimeCounter
                className={styles.preLaunchTimer}
                duration={duration}
                onCountingFinish={() => setIsPollingForCurrentEpoch(true)}
                timestamp={preLaunchEndTimestamp}
              />
            </BoxRounded>
          )}
          <BoxGlmLock classNameBox={styles.box} />
          <BoxPersonalAllocation className={styles.box} />
        </div>
        <History className={styles.column} />
      </div>
    </MainLayout>
  );
};

export default EarnView;
