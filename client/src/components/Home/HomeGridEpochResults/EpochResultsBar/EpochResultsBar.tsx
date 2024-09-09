import { animate, AnimatePresence, motion, useInView } from 'framer-motion';
import React, { FC, useEffect, useRef, useState } from 'react';

import Img from 'components/ui/Img';
import { EPOCH_RESULTS_BAR_ID } from 'constants/domElementsIds';
import env from 'env';
import useProjectsIpfs from 'hooks/queries/useProjectsIpfs';

import styles from './EpochResultsBar.module.scss';
import EpochResultsBarProps from './types';

const EpochResultsBar: FC<EpochResultsBarProps> = ({
  address,
  topBarHeightPercentage,
  bottomBarHeightPercentage,
  onClick,
  isHighlighted,
  isLowlighted,
}) => {
  const { ipfsGateways } = env;
  const topBarRef = useRef(null);
  const bottomBarRef = useRef(null);
  const ref = useRef(null);

  const isInView = useInView(ref);

  const [isProjectLogoVisible, setIsProjectLogoVisible] = useState(false);

  const { data: projectIpfs } = useProjectsIpfs([address]);

  const projectLogoImageSources = ipfsGateways
    .split(',')
    .map(element => `${element}${projectIpfs[0]?.profileImageSmall}`);

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
      animate={{ opacity: isLowlighted ? 0.5 : 1 }}
      className={styles.root}
      id={EPOCH_RESULTS_BAR_ID}
      onClick={() => onClick(address)}
      onMouseLeave={() => setIsProjectLogoVisible(false)}
      onMouseOver={() => setIsProjectLogoVisible(true)}
      whileHover={{ opacity: 1 }}
    >
      <AnimatePresence>
        {(isProjectLogoVisible || isHighlighted) && (
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
              bottom: `calc(${topBarHeightPercentage > bottomBarHeightPercentage ? topBarHeightPercentage : bottomBarHeightPercentage}% - 1rem)`,
              opacity: 0,
              scale: 0.5,
              x: '50%',
            }}
          >
            <Img className={styles.projectLogoImg} sources={projectLogoImageSources} />
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
