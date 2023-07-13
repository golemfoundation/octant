import cx from 'classnames';
import { useAnimate } from 'framer-motion';
import React, { FC, Fragment, useEffect, useRef } from 'react';

import Button from 'components/core/Button/Button';
import Svg from 'components/core/Svg/Svg';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';

import styles from './Navbar.module.scss';
import NavbarProps from './types';

const Navbar: FC<NavbarProps> = ({ navigationBottomSuffix, tabs }) => {
  const { allocations } = useAllocationsStore(state => ({
    allocations: state.data.allocations,
  }));
  const allocationsPrevRef = useRef(allocations);

  const { isDesktop } = useMediaQuery();
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (!scope?.current || allocations.length === allocationsPrevRef.current.length) {
      return;
    }
    animate(scope?.current, { scale: [1.1, 1] });
    allocationsPrevRef.current = allocations;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocations]);

  return (
    <Fragment>
      <div className={styles.navigationWrapper} data-test="Navbar">
        <nav className={styles.navigation}>
          {navigationBottomSuffix && (
            <div className={styles.navigationBottomSuffix}>{navigationBottomSuffix}</div>
          )}
          <div className={styles.buttons}>
            {tabs.map(({ icon, label, to, isActive }, index) => (
              <Button
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={styles.buttonNavigation}
                dataTest={`Navbar__Button--${label}`}
                Icon={<Svg img={icon} size={isDesktop ? 4 : 3.2} />}
                isActive={isActive}
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
        <div className={styles.coinGecko}>Powered by CoinGecko API</div>
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
