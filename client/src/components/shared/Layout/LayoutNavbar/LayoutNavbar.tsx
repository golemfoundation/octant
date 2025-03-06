import cx from 'classnames';
import { useAnimate } from 'framer-motion';
import React, { FC, Fragment, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import { ELEMENT_POSITION_FIXED_CLASSNAME } from 'constants/css';
import { LAYOUT_NAVBAR_ID } from 'constants/domElementsIds';
import { WINDOW_PROJECTS_SCROLL_Y } from 'constants/window';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useNavigationTabs from 'hooks/helpers/useNavigationTabs';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';

import styles from './LayoutNavbar.module.scss';
import LayoutNavbarProps from './types';

const LayoutNavbar: FC<LayoutNavbarProps> = ({ navigationBottomSuffix }) => {
  const { allocations } = useAllocationsStore(state => ({
    allocations: state.data.allocations,
  }));
  const allocationsPrevRef = useRef(allocations);

  const { isTablet } = useMediaQuery();
  const location = useLocation();
  const [scope, animate] = useAnimate();
  const isProjectAdminMode = useIsProjectAdminMode();
  const tabs = useNavigationTabs();

  const dataTestRoot = 'LayoutNavbar';

  useEffect(() => {
    if (!scope?.current || allocations.length === allocationsPrevRef.current.length) {
      return;
    }
    animate([
      [scope?.current, { scale: [isTablet ? 1.4 : 1.5] }, { duration: 0.15, ease: 'easeOut' }],
      [scope?.current, { scale: 1 }, { duration: 0.15, ease: 'easeOut' }],
    ]);
    allocationsPrevRef.current = allocations;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocations]);

  return (
    <Fragment>
      <div
        className={cx(styles.navigationWrapper, ELEMENT_POSITION_FIXED_CLASSNAME)}
        data-test={`${dataTestRoot}__wrapper`}
      >
        <nav className={styles.navigation} data-test={dataTestRoot} id={LAYOUT_NAVBAR_ID}>
          <div
            className={cx(styles.buttons, isProjectAdminMode && styles.isProjectAdminMode)}
            data-test={`${dataTestRoot}__buttons`}
          >
            {tabs.map(
              ({ key, icon, id, label, to, isActive, isDisabled = false, isBigIcon = false }) => (
                <Button
                  key={key}
                  className={cx(styles.buttonNavigation, isActive && styles.isActive)}
                  dataTest={`${dataTestRoot}__Button--${key}`}
                  Icon={
                    isBigIcon ? (
                      <Svg
                        classNameSvg={styles.bigIcon}
                        dataTest={`${dataTestRoot}__Button__Svg--${key}`}
                        img={icon}
                        size={isTablet ? 3 : 2.4}
                      />
                    ) : (
                      <Svg
                        classNameSvg={
                          to === ROOT_ROUTES.home.absolute ? styles.octantLogo : undefined
                        }
                        dataTest={`${dataTestRoot}__Button__Svg--${key}`}
                        img={icon}
                        size={isTablet ? 4 : 3.2}
                      />
                    )
                  }
                  id={id}
                  isActive={isActive}
                  isDisabled={isDisabled}
                  label={label}
                  onClick={() => {
                    if (location.pathname !== ROOT_ROUTES.projects.absolute) {
                      return;
                    }
                    window[WINDOW_PROJECTS_SCROLL_Y] = window.scrollY;
                  }}
                  to={to}
                  variant="iconVertical"
                >
                  {to === ROOT_ROUTES.allocation.absolute && allocations.length > 0 && (
                    <div
                      ref={scope}
                      className={styles.numberOfAllocations}
                      data-test={`${dataTestRoot}__numberOfAllocations`}
                    >
                      {allocations.length}
                    </div>
                  )}
                </Button>
              ),
            )}
          </div>
        </nav>
      </div>
      <div
        className={cx(
          styles.navigationBlur,
          navigationBottomSuffix && styles.hasNavigationBottomSuffix,
        )}
      />
    </Fragment>
  );
};

export default LayoutNavbar;
