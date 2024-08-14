import cx from 'classnames';
import React, { Fragment, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useNavigationTabs from 'hooks/helpers/useNavigationTabs';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useLayoutStore from 'store/layout/store';
import { octant } from 'svg/logo';
import { calendar, chevronBottom } from 'svg/misc';
import { allocate, settings } from 'svg/navigation';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './LayoutTopBar.module.scss';

const LayoutTopBar = (): ReactNode => {
  const { t } = useTranslation('translation', { keyPrefix: 'layout.topBar' });
  const { isDesktop, isMobile } = useMediaQuery();
  const { isConnected, address } = useAccount();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: currentEpoch } = useCurrentEpoch();
  const { setShowWalletModal, setShowConnectWalletModal } = useLayoutStore(state => ({
    setShowConnectWalletModal: state.setShowConnectWalletModal,
    setShowWalletModal: state.setShowWalletModal,
  }));

  const tabs = useNavigationTabs(true);

  const allocationInfoText = useMemo(() => {
    const epoch = currentEpoch! - 1;

    if (isDecisionWindowOpen) {
      return isMobile
        ? t('epochAllocationWindowOpenShort', { epoch })
        : t('epochAllocationWindowOpen', { epoch });
    }

    return isMobile
      ? t('epochAllocationWindowClosedShort', { epoch })
      : t('epochAllocationWindowClosed', { epoch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDecisionWindowOpen, currentEpoch, isMobile]);

  const buttonWalletText = useMemo(() => {
    if (!isConnected) {
      return !isMobile ? t('connectWallet') : t('connect');
    }

    return truncateEthAddress(address!, isMobile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isConnected, isMobile]);

  const onLogoClick = () => {
    if (pathname === ROOT_ROUTES.projects.absolute) {
      window.scrollTo({ behavior: 'smooth', top: 0 });
      return;
    }

    navigate(ROOT_ROUTES.home.absolute);
  };

  return (
    <div className={styles.root}>
      <Svg classNameSvg={styles.octantLogo} img={octant} onClick={onLogoClick} size={4} />
      {isDesktop && (
        <div className={styles.links}>
          {tabs.map(tab => (
            <div
              key={tab.key}
              className={cx(styles.link, tab.isActive && styles.isActive)}
              onClick={() => navigate(tab.to)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      )}
      <div className={styles.allocationInfo}>
        {!isMobile && <Svg classNameSvg={styles.calendarIcon} img={calendar} size={1.6} />}
        {allocationInfoText}
      </div>
      <Button
        className={cx(styles.buttonWallet, !isConnected && styles.isConnectButton)}
        onClick={() => (isConnected ? setShowWalletModal(true) : setShowConnectWalletModal(true))}
        variant="cta"
      >
        {buttonWalletText}
        {isConnected && (
          <Svg classNameSvg={styles.buttonWalletArrow} img={chevronBottom} size={1} />
        )}
      </Button>
      {isDesktop && (
        <Fragment>
          <div className={styles.settingsButton}>
            <Svg classNameSvg={styles.settingsButtonIcon} img={settings} size={2} />
          </div>
          <div className={styles.allocateButton}>
            <Svg classNameSvg={styles.allocateButtonIcon} img={allocate} size={2} />
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default LayoutTopBar;
