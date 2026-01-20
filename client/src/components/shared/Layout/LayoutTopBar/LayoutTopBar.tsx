import cx from 'classnames';
import { useAnimate, motion, AnimatePresence } from 'framer-motion';
import React, { FC, Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

import Allocation from 'components/Allocation';
import ModalMigration from 'components/Home/ModalMigration';
import Settings from 'components/Settings';
import LayoutTopBarCalendar from 'components/shared/Layout/LayoutTopBarCalendar';
import Button from 'components/ui/Button';
import Drawer from 'components/ui/Drawer';
import Svg from 'components/ui/Svg';
import TinyLabel from 'components/ui/TinyLabel';
import { TOURGUIDE_ELEMENT_3 } from 'constants/domElementsIds';
import networkConfig from 'constants/networkConfig';
import { WINDOW_PROJECTS_SCROLL_Y } from 'constants/window';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useNavigationTabs from 'hooks/helpers/useNavigationTabs';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';
import useDelegationStore from 'store/delegation/store';
import useLayoutStore from 'store/layout/store';
import { octant } from 'svg/logo';
import { chevronBottom, cross } from 'svg/misc';
import { allocate, settings } from 'svg/navigation';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './LayoutTopBar.module.scss';
import LayoutTopBarProps from './types';

const LayoutTopBar: FC<LayoutTopBarProps> = ({ className }) => {
  const dataTestRoot = 'LayoutTopBar';
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'layout.topBar' });
  const { isDesktop, isMobile } = useMediaQuery();
  const { isConnected, address } = useAccount();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const {
    isSettingsDrawerOpen,
    isAllocationDrawerOpen,
    setIsWalletModalOpen,
    setIsConnectWalletModalOpen,
    setIsAllocationDrawerOpen,
    setIsSettingsDrawerOpen,
  } = useLayoutStore(state => ({
    isAllocationDrawerOpen: state.data.isAllocationDrawerOpen,
    isSettingsDrawerOpen: state.data.isSettingsDrawerOpen,
    setIsAllocationDrawerOpen: state.setIsAllocationDrawerOpen,
    setIsConnectWalletModalOpen: state.setIsConnectWalletModalOpen,
    setIsSettingsDrawerOpen: state.setIsSettingsDrawerOpen,
    setIsWalletModalOpen: state.setIsWalletModalOpen,
  }));

  const { isTimeoutListPresenceModalOpen } = useDelegationStore(state => ({
    isTimeoutListPresenceModalOpen: state.data.isTimeoutListPresenceModalOpen,
  }));
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();
  const { allocations } = useAllocationsStore(state => ({
    allocations: state.data.allocations,
  }));
  const [isCloseButtonExpanded, setIsCloseButtonExpanded] = useState(true);
  const [isModalMigrateOpen, setIsModalMigrateOpen] = useState<boolean>(false);

  const allocationsPrevRef = useRef(allocations);

  const tabs = useNavigationTabs(true);
  const [scope, animate] = useAnimate();
  const [closeButtonRef, animateCloseButton] = useAnimate();

  const isTestnet = window.Cypress ? !!window.isTestnetCypress : networkConfig.isTestnet;

  const buttonWalletText = useMemo(() => {
    if (!isConnected || !address) {
      return !isMobile ? t('connectWallet') : t('connect');
    }

    if (isProjectAdminMode || isPatronMode) {
      return `${isProjectAdminMode ? t('admin') : t('patron')}${isMobile ? '' : ` ${truncateEthAddress(address!, true)}`}`;
    }

    return truncateEthAddress(address!, isMobile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isConnected, isMobile, isProjectAdminMode, isPatronMode, i18n.language]);

  const onLogoClick = () => {
    if (pathname === ROOT_ROUTES.home.absolute) {
      window.scrollTo({ behavior: 'smooth', top: 0 });
      return;
    }

    navigate(ROOT_ROUTES.home.absolute);
  };

  useEffect(() => {
    if (pathname !== ROOT_ROUTES.settings.absolute || !isDesktop) {
      return;
    }

    setIsSettingsDrawerOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop, pathname]);

  useEffect(() => {
    if (isSettingsDrawerOpen && pathname !== ROOT_ROUTES.settings.absolute && !isDesktop) {
      navigate(ROOT_ROUTES.settings.absolute);
      setIsSettingsDrawerOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop, pathname, isSettingsDrawerOpen]);

  useEffect(() => {
    if (
      pathname !== ROOT_ROUTES.allocation.absolute ||
      !isDesktop ||
      isPatronMode ||
      isProjectAdminMode
    ) {
      return;
    }

    setIsAllocationDrawerOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop, pathname, isPatronMode, isProjectAdminMode]);

  useEffect(() => {
    if (isAllocationDrawerOpen && pathname !== ROOT_ROUTES.allocation.absolute && !isDesktop) {
      navigate(ROOT_ROUTES.allocation.absolute);
      setIsAllocationDrawerOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop, pathname, isAllocationDrawerOpen]);

  useEffect(() => {
    if (!scope?.current || allocations.length === allocationsPrevRef.current.length) {
      return;
    }
    animate([
      [scope?.current, { scale: 1.5 }, { duration: 0.15, ease: 'easeOut' }],
      [scope?.current, { scale: 1 }, { duration: 0.15, ease: 'easeOut' }],
    ]);
    allocationsPrevRef.current = allocations;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocations]);

  useEffect(() => {
    if (!closeButtonRef?.current) {
      return;
    }
    animateCloseButton(
      closeButtonRef?.current,
      {
        width: isCloseButtonExpanded ? '13.2rem' : '3.2rem',
      },
      { delay: 0.25 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCloseButtonExpanded]);

  return (
    <>
      <div className={cx(styles.root, className)} data-test={dataTestRoot}>
        <div className={styles.logoWrapper}>
          <Svg
            classNameSvg={cx(styles.octantLogo, isTestnet && styles.isTestnet)}
            dataTest={`${dataTestRoot}__Logo`}
            img={octant}
            onClick={onLogoClick}
            size={4}
          />
          {isTestnet && (
            <TinyLabel
              className={styles.testnetIndicator}
              dataTest={`${dataTestRoot}__Logo__testnetIndicator`}
              onClick={onLogoClick}
              text={networkConfig.name}
              textClassName={styles.testnetIndicatorText}
            />
          )}
        </div>
        {isDesktop && (
          <div className={styles.links} data-test={`${dataTestRoot}__links`}>
            {tabs.map(({ label, to, isActive, isDisabled, key }) => (
              <div
                key={key}
                className={cx(
                  styles.link,
                  isActive && styles.isActive,
                  isTestnet && styles.isTestnet,
                )}
                data-test={`${dataTestRoot}__link--${key}`}
                onClick={
                  isDisabled && to
                    ? () => {}
                    : () => {
                        if (pathname === ROOT_ROUTES.projects.absolute) {
                          window[WINDOW_PROJECTS_SCROLL_Y] = window.scrollY;
                        }
                        navigate(to);
                      }
                }
              >
                {label}
                {isActive ? (
                  <div className={styles.underlineWrapper}>
                    <motion.div
                      animate={{ opacity: 1 }}
                      className={styles.underline}
                      data-test={`${dataTestRoot}__underline--${key}`}
                      initial={{ opacity: 0 }}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
        {isDesktop && <LayoutTopBarCalendar />}
        <div className={styles.buttons}>
          <Button
            className={styles.buttonMigrate}
            dataTest={`${dataTestRoot}__ButtonMigrate`}
            isDisabled={!isConnected}
            onClick={() => setIsModalMigrateOpen(true)}
            variant="cta"
          >
            <div className={styles.dot} />
            {t('migration.topBar.buttonMigrate')}
          </Button>
          <Button
            className={cx(
              styles.buttonWallet,
              !isConnected && styles.isConnectButton,
              isPatronMode && styles.isPatronMode,
              isProjectAdminMode && styles.isProjectAdminMode,
            )}
            dataTest={`${dataTestRoot}__Button`}
            onClick={() =>
              isConnected ? setIsWalletModalOpen(true) : setIsConnectWalletModalOpen(true)
            }
            variant="secondary"
          >
            {buttonWalletText}
            {isConnected && (
              <Svg classNameSvg={styles.buttonWalletArrow} img={chevronBottom} size={1} />
            )}
          </Button>
        </div>
        {isDesktop && (
          <Fragment>
            <div
              className={cx(styles.settingsButton, isTestnet && styles.isTestnet)}
              data-test={`${dataTestRoot}__settingsButton`}
              onClick={() => setIsSettingsDrawerOpen(!isSettingsDrawerOpen)}
            >
              <Svg classNameSvg={styles.settingsButtonIcon} img={settings} size={2} />
            </div>
            {!(isProjectAdminMode || isPatronMode) && (
              <div
                className={cx(styles.allocateButton, isTestnet && styles.isTestnet)}
                data-test={`${dataTestRoot}__allocationButton`}
                id={TOURGUIDE_ELEMENT_3}
                onClick={() => setIsAllocationDrawerOpen(!isAllocationDrawerOpen)}
              >
                <Svg classNameSvg={styles.allocateButtonIcon} img={allocate} size={2} />
                {allocations.length > 0 && (
                  <div
                    ref={scope}
                    className={styles.numberOfAllocations}
                    data-test={`${dataTestRoot}__numberOfAllocations`}
                  >
                    {allocations.length}
                  </div>
                )}
              </div>
            )}
          </Fragment>
        )}
        {isDesktop && (
          <>
            <Drawer
              dataTest="SettingsDrawer"
              isOpen={isSettingsDrawerOpen && !isTimeoutListPresenceModalOpen?.value}
              onClose={() => setIsSettingsDrawerOpen(false)}
            >
              <Settings />
            </Drawer>
            {!(isPatronMode || isProjectAdminMode) && (
              <Drawer
                CustomCloseButton={
                  <div
                    ref={closeButtonRef}
                    className={cx(
                      styles.customCloseButton,
                      isCloseButtonExpanded && styles.isCloseButtonExpanded,
                    )}
                    data-test="AllocationDrawer__closeButton"
                    onClick={() => setIsAllocationDrawerOpen(false)}
                  >
                    <AnimatePresence>
                      {isCloseButtonExpanded && (
                        <motion.div
                          animate={{ opacity: 1 }}
                          className={styles.customCloseButtonText}
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          {t('closeDrawerWithArrow')}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Svg classNameSvg={styles.customCloseButtonSvg} img={cross} size={1} />
                  </div>
                }
                dataTest="AllocationDrawer"
                isOpen={isAllocationDrawerOpen && !isTimeoutListPresenceModalOpen?.value}
                onClose={() => setIsAllocationDrawerOpen(false)}
                onMouseLeave={() => setIsCloseButtonExpanded(false)}
                onMouseOver={() => setIsCloseButtonExpanded(true)}
              >
                <Allocation />
              </Drawer>
            )}
          </>
        )}
      </div>
      {!isDesktop && <LayoutTopBarCalendar className={styles.calendar} />}
      <ModalMigration
        modalProps={{
          dataTest: 'ModalMigration',
          isOpen: isModalMigrateOpen,
          onClosePanel: () => setIsModalMigrateOpen(false),
        }}
      />
    </>
  );
};

export default LayoutTopBar;
