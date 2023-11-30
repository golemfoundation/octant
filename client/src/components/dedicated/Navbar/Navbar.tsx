import cx from 'classnames';
import { useAnimate } from 'framer-motion';
import React, { FC, Fragment, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import { ELEMENT_POSITION_FIXED_CLASSNAME } from 'constants/css';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useUserTOS from 'hooks/queries/useUserTOS';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';

import styles from './Navbar.module.scss';
import NavbarProps from './types';

const Navbar: FC<NavbarProps> = ({ navigationBottomSuffix, tabs }) => {
  const { isConnected } = useAccount();
  const { data: isUserTOSAccepted } = useUserTOS();
  const { allocations } = useAllocationsStore(state => ({
    allocations: state.data.allocations,
  }));
  const allocationsPrevRef = useRef(allocations);

  const { isDesktop } = useMediaQuery();
  const [scope, animate] = useAnimate();
  const isProjectAdminMode = useIsProjectAdminMode();

  const areTabsDisabled = isConnected && !isUserTOSAccepted;

  useEffect(() => {
    if (!scope?.current || allocations.length === allocationsPrevRef.current.length) {
      return;
    }
    animate([
      [scope?.current, { scale: [isDesktop ? 1.4 : 1.5] }, { duration: 0.15, ease: 'easeOut' }],
      [scope?.current, { scale: 1 }, { duration: 0.15, ease: 'easeOut' }],
    ]);
    allocationsPrevRef.current = allocations;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocations]);

  return (
    <Fragment>
      <div
        className={cx(styles.navigationWrapper, ELEMENT_POSITION_FIXED_CLASSNAME)}
        data-test="Navbar"
      >
        <nav className={styles.navigation}>
          {navigationBottomSuffix && (
            <div className={styles.navigationBottomSuffix}>{navigationBottomSuffix}</div>
          )}
          <div
            className={cx(styles.buttons, isProjectAdminMode && styles.isProjectAdminMode)}
            data-test="Navbar__buttons"
          >
            {tabs.map(({ icon, label, to, isActive, isDisabled = false }, index) => (
              <Button
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={cx(styles.buttonNavigation, isActive && styles.isActive)}
                dataTest={`Navbar__Button--${label}`}
                Icon={<Svg img={icon} size={isDesktop ? 4 : 3.2} />}
                isActive={isActive}
                isDisabled={isDisabled || areTabsDisabled}
                label={label}
                to={to}
                variant="iconVertical"
              >
                {to === ROOT_ROUTES.allocation.absolute && allocations.length > 0 && (
                  <div
                    ref={scope}
                    className={styles.numberOfAllocations}
                    data-test="Navbar__numberOfAllocations"
                  >
                    {allocations.length}
                  </div>
                )}
              </Button>
            ))}
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

export default Navbar;
