import cx from 'classnames';
import React, { FC, Fragment, useEffect, useRef } from 'react';

import LayoutFooter from 'components/shared/Layout/LayoutFooter';
import LayoutNavbar from 'components/shared/Layout/LayoutNavbar';
import LayoutTopBar from 'components/shared/Layout/LayoutTopBar';
import ModalLayoutConnectWallet from 'components/shared/Layout/ModalLayoutConnectWallet';
import ModalLayoutWallet from 'components/shared/Layout/ModalLayoutWallet';
import Loader from 'components/ui/Loader';
import { LAYOUT_BODY_ID } from 'constants/domElementsIds';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useLayoutStore from 'store/layout/store';
import SyncView from 'views/SyncView';

import styles from './Layout.module.scss';
import LayoutProps from './types';

const Layout: FC<LayoutProps> = ({
  children,
  dataTest,
  navigationBottomSuffix,
  isLoading,
  isNavigationVisible = true,
  classNameBody,
  isSyncingInProgress,
}) => {
  const { isMobile, isDesktop } = useMediaQuery();
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();

  const ref = useRef(null);
  const topBarWrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(window.scrollY);
  const lastScrollYUpRef = useRef(0);

  const {
    setIsWalletModalOpen,
    setIsConnectWalletModalOpen,
    data: { isWalletModalOpen, isConnectWalletModalOpen },
  } = useLayoutStore(state => ({
    data: {
      isConnectWalletModalOpen: state.data.isConnectWalletModalOpen,
      isWalletModalOpen: state.data.isWalletModalOpen,
    },
    setIsConnectWalletModalOpen: state.setIsConnectWalletModalOpen,
    setIsWalletModalOpen: state.setIsWalletModalOpen,
  }));

  // Logic that hides TopBar when scrolling down and shows when scrolling up (only on mobile devices)
  useEffect(() => {
    if (!topBarWrapperRef?.current) {
      return;
    }
    const topBarWrapperEl = topBarWrapperRef.current;

    const listener = e => {
      if (e.target.body.className === 'bodyFixed') {
        return;
      }
      const { offsetTop, clientHeight } = topBarWrapperEl;

      if (window.scrollY > scrollRef.current) {
        topBarWrapperEl.style.position = 'absolute';
        if (window.scrollY < lastScrollYUpRef.current + clientHeight) {
          topBarWrapperEl.style.top = `${lastScrollYUpRef.current}px`;
        } else if (window.scrollY >= clientHeight) {
          topBarWrapperEl.style.top = `${window.scrollY - clientHeight}px`;
        }
      } else {
        lastScrollYUpRef.current = window.scrollY;
        if (window.scrollY <= offsetTop) {
          topBarWrapperEl.style.top = '0px';
          topBarWrapperEl.style.position = 'fixed';
        }
      }

      scrollRef.current = window.scrollY;
    };

    if (!isMobile) {
      return;
    }

    lastScrollYUpRef.current = window.scrollY;
    document.addEventListener('scroll', listener);

    return () => {
      topBarWrapperEl.style.position = 'fixed';
      topBarWrapperEl.style.top = '0px';
      document.removeEventListener('scroll', listener);
    };
  }, [isMobile]);

  if (isSyncingInProgress) {
    return <SyncView />;
  }

  return (
    <Fragment>
      <div ref={ref} className={styles.root} data-test={dataTest}>
        <div
          ref={topBarWrapperRef}
          className={cx(
            styles.topBarWrapper,
            isProjectAdminMode && styles.isProjectAdminMode,
            isPatronMode && styles.isPatronMode,
          )}
        >
          <LayoutTopBar className={styles.section} />
        </div>
        <div
          className={cx(
            styles.body,
            styles.section,
            isLoading && styles.isLoading,
            !!navigationBottomSuffix && styles.isNavigationBottomSuffix,
            classNameBody,
          )}
          data-test="Layout__body"
          id={LAYOUT_BODY_ID}
        >
          {isLoading ? <Loader dataTest="Layout__Loader" /> : children}
        </div>
        {!isDesktop && isNavigationVisible && (
          <LayoutNavbar navigationBottomSuffix={navigationBottomSuffix} />
        )}
        <LayoutFooter className={styles.section} />
      </div>
      <ModalLayoutWallet
        modalProps={{
          isOpen: isWalletModalOpen,
          onClosePanel: () => setIsWalletModalOpen(false),
        }}
      />
      <ModalLayoutConnectWallet
        modalProps={{
          isOpen: isConnectWalletModalOpen,
          onClosePanel: () => setIsConnectWalletModalOpen(false),
        }}
      />
    </Fragment>
  );
};

export default Layout;
