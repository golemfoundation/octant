import { AnimatePresence, motion } from 'framer-motion';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/ui/Button';
import Loader from 'components/ui/Loader';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useAllocationsStore from 'store/allocations/store';
import { CurrentView } from 'store/allocations/types';

import styles from './AllocationNavigation.module.scss';
import AllocationNavigationProps from './types';

const AllocationNavigation: FC<AllocationNavigationProps> = ({
  isLeftButtonDisabled,
  areButtonsDisabled,
  isLoading,
  onAllocate,
  onResetValues,
  isWaitingForAllMultisigSignatures,
}) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationNavigation',
  });
  const { currentView, setCurrentView } = useAllocationsStore(state => ({
    currentView: state.data.currentView,
    setCurrentView: state.setCurrentView,
  }));

  const { data: userAllocations } = useUserAllocations(undefined, { refetchOnMount: true });
  const [isInitialCurrentViewSet, setIsInitialCurrentViewSet] = useState(false);

  const [showTickAnimation, setShowTickAnimation] = useState(false);
  const [showCircleAnimation, setShowCircleAnimation] = useState(false);
  const prevCurrentViewRef = useRef<CurrentView>(
    userAllocations?.hasUserAlreadyDoneAllocation ? 'summary' : 'edit',
  );

  const cxcy = 8;
  const r = 7;

  const nextButtonLabel = useMemo(() => {
    if (isLoading || isWaitingForAllMultisigSignatures) {
      return t('waiting');
    }
    if (currentView === 'summary' && (showTickAnimation || showCircleAnimation)) {
      return i18n.t('common.confirmed');
    }
    if (currentView === 'summary') {
      return i18n.t('common.edit');
    }
    return t('confirm');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentView,
    isLoading,
    isWaitingForAllMultisigSignatures,
    showTickAnimation,
    showCircleAnimation,
    areButtonsDisabled,
  ]);

  useEffect(() => {
    if (isLoading || areButtonsDisabled || !isInitialCurrentViewSet) {return;}
    if (prevCurrentViewRef.current === 'edit' && currentView === 'summary') {
      setShowCircleAnimation(true);
    }
    if (prevCurrentViewRef.current === 'summary' && currentView === 'edit') {
      prevCurrentViewRef.current = 'edit';
      
    }
  }, [currentView, isLoading, areButtonsDisabled]);

  useEffect(() => {
    if (!userAllocations?.hasUserAlreadyDoneAllocation) {return;}
    setCurrentView('summary');
    setIsInitialCurrentViewSet(true);
  }, []);

  return (
    <div className={styles.root}>
      <Button
        className={styles.button}
        isDisabled={isLeftButtonDisabled || areButtonsDisabled}
        label={t('reset')}
        onClick={onResetValues}
      />
      <Button
        className={styles.button}
        isDisabled={isLoading || areButtonsDisabled}
        label={nextButtonLabel}
        onClick={currentView === 'edit' ? onAllocate : () => setCurrentView('edit')}
        variant="cta"
      >
        <div className={styles.animationsWrapper}>
          {isLoading && (
            <div className={styles.loaderWrapper}>
              <Loader color="white" variant="small" />
            </div>
          )}
          <AnimatePresence>
            {showTickAnimation && (
              <motion.svg
                key="tickSvg"
                animate={{ scale: [0, 1, 0.7], strokeWidth: [2, 3, 2] }}
                className={styles.tickSvg}
                initial={{ left: '50%', top: '50%', x: '-50%', y: '-50%' }}
                onAnimationComplete={() => setShowTickAnimation(false)}
                transition={{
                  delay: 0.35,
                  duration: 2,
                  ease: 'linear',
                  times: [0, 0.1, 0.2],
                }}
              >
                <path
                  d="m1.407 6.664 2.938 3.752 8.485-8.485"
                  fill="transparent"
                  stroke={styles.colorWhite}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            )}
            {showCircleAnimation && (
              <motion.svg
                key="circleSvg"
                className={styles.circleSvg}
                exit={{ opacity: 0, scale: 2, transition: { delay: 0.3, duration: 0.4 } }}
                initial={{ left: '50%', opacity: 1, top: '50%', x: '-50%', y: '-50%' }}
                transition={{
                  duration: 0.4,
                  ease: 'linear',
                }}
                viewBox="0 0 16 16"
              >
                <circle className={styles.circleLoaderBackground} cx={cxcy} cy={cxcy} r={r} />
                <motion.circle
                  key="circleSvg__loader"
                  animate={{ opacity: 1, pathLength: [0, 1.01] }}
                  className={styles.circleLoader}
                  cx={cxcy}
                  cy={cxcy}
                  initial={{ rotate: 270 }}
                  onAnimationComplete={() => {
                    setShowCircleAnimation(false);
                    setShowTickAnimation(true);
                  }}
                  r={r}
                  transition={{
                    duration: 0.4,
                    ease: 'linear',
                  }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>
      </Button>
    </div>
  );
};

export default AllocationNavigation;
