import cx from 'classnames';
import { animate, AnimatePresence, motion, useInView } from 'framer-motion';
import React, { FC, useEffect, useRef } from 'react';

import Img from 'components/ui/Img';
import { EPOCH_RESULTS_BAR_ID } from 'constants/domElementsIds';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';

import styles from './EpochResultsBar.module.scss';
import EpochResultsBarProps from './types';

const EpochResultsBar: FC<EpochResultsBarProps> = ({
  address,
  topBarHeightPercentage,
  bottomBarHeightPercentage,
  setHighlightedBarAddress,
  isHighlighted,
  imageSources,
  epoch,
  isDragging,
}) => {
  const topBarRef = useRef(null);
  const bottomBarRef = useRef(null);
  const ref = useRef(null);
  const { isMobile } = useMediaQuery();

  const isInView = useInView(ref);

  useEffect(() => {
    if (!isInView) {
      return;
    }
    const a = animate(topBarRef.current, { height: `${topBarHeightPercentage}%` });
    return () => {
      a.cancel();
    };
  }, [topBarHeightPercentage, isInView]);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    const a = animate(bottomBarRef.current, { height: `${bottomBarHeightPercentage}%` });
    return () => {
      a.cancel();
    };
  }, [bottomBarHeightPercentage, isInView]);

  return (
    <motion.div
      ref={ref}
      className={cx(styles.root, topBarHeightPercentage && styles.hasValue)}
      id={EPOCH_RESULTS_BAR_ID}
      onClick={e => {
        e.stopPropagation();
        if (isDragging) {
          return;
        }
        if (isMobile) {
          setHighlightedBarAddress(address);
          return;
        }
        window.open(`${ROOT_ROUTES.project.absolute}/${epoch}/${address}`);
      }}
      onMouseOver={() => {
        if (isDragging || isMobile) {
          return;
        }
        setHighlightedBarAddress(address);
      }}
    >
      <AnimatePresence>
        {isHighlighted && (
          <motion.div
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className={styles.projectLogo}
            exit={{
              opacity: 0,
              scale: 0.5,
            }}
            initial={{
              bottom: `calc(${topBarHeightPercentage > bottomBarHeightPercentage ? topBarHeightPercentage : bottomBarHeightPercentage}% + 1rem)`,
              opacity: 0,
              scale: 0.5,
              x: '50%',
            }}
          >
            <Img className={styles.projectLogoImg} sources={imageSources} />
            <div className={styles.triangle} />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div ref={topBarRef} className={styles.topBar} initial={{ height: 0 }} />
      <motion.div ref={bottomBarRef} className={styles.bottomBar} initial={{ height: 0 }} />
    </motion.div>
  );
};

export default EpochResultsBar;
