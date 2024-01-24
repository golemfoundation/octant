import React, { Fragment, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import TipTile from 'components/shared/TipTile';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useWithdrawals from 'hooks/queries/useWithdrawals';
import useTipsStore from 'store/tips/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

const EarnTipTiles = (): ReactElement => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'views.earn.tips',
  });
  const { isConnected } = useAccount();
  const { isDesktop } = useMediaQuery();
  const { data: withdrawals } = useWithdrawals();
  const { data: currentEpoch } = useCurrentEpoch();
  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const { data: depositsValue, isFetching: isFetchingDepositsValue } = useDepositValue();

  const {
    wasWithdrawAlreadyClosed,
    setWasWithdrawAlreadyClosed,
    wasConnectWalletAlreadyClosed,
    setWasConnectWalletAlreadyClosed,
    wasLockGLMAlreadyClosed,
    setWasLockGLMAlreadyClosed,
  } = useTipsStore(state => ({
    setWasConnectWalletAlreadyClosed: state.setWasConnectWalletAlreadyClosed,
    setWasLockGLMAlreadyClosed: state.setWasLockGLMAlreadyClosed,
    setWasWithdrawAlreadyClosed: state.setWasWithdrawAlreadyClosed,
    wasConnectWalletAlreadyClosed: state.data.wasConnectWalletAlreadyClosed,
    wasLockGLMAlreadyClosed: state.data.wasLockGLMAlreadyClosed,
    wasWithdrawAlreadyClosed: state.data.wasWithdrawAlreadyClosed,
  }));

  const isLockGlmTipVisible =
    !isFetchingDepositsValue &&
    (!depositsValue || (!!depositsValue && depositsValue.isZero())) &&
    isConnected &&
    !wasLockGLMAlreadyClosed;
  const isConnectWalletTipVisible = !isPreLaunch && !isConnected && !wasConnectWalletAlreadyClosed;
  const isWithdrawTipVisible =
    !!currentEpoch &&
    currentEpoch > 1 &&
    !!withdrawals &&
    !withdrawals.sums.available.isZero() &&
    !wasWithdrawAlreadyClosed;

  return (
    <Fragment>
      <TipTile
        image={isDesktop ? 'images/lock-glm-desktop.webp' : 'images/lock-glm-mobile.webp'}
        infoLabel={i18n.t('common.gettingStarted')}
        isOpen={isLockGlmTipVisible}
        onClose={() => setWasLockGLMAlreadyClosed(true)}
        text={t('lockGlm.text')}
        title={t('lockGlm.title')}
      />
      <TipTile
        dataTest="EarnView__TipTile--connectWallet"
        image="images/tip-connect-wallet.webp"
        infoLabel={i18n.t('common.gettingStarted')}
        isOpen={isConnectWalletTipVisible}
        onClose={() => setWasConnectWalletAlreadyClosed(true)}
        text={t('connectWallet.text')}
        title={t(isDesktop ? 'connectWallet.title.desktop' : 'connectWallet.title.mobile')}
      />
      <TipTile
        image="images/tip-withdraw.webp"
        infoLabel={i18n.t('common.gettingStarted')}
        isOpen={isWithdrawTipVisible}
        onClose={() => setWasWithdrawAlreadyClosed(true)}
        text={t('withdrawEth.text')}
        title={t('withdrawEth.title')}
      />
    </Fragment>
  );
};

export default EarnTipTiles;
