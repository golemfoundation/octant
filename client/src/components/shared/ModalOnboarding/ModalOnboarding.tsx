import cx from 'classnames';
import { AnimatePresence, AnimationProps, motion } from 'framer-motion';
import React, { useState, useEffect, useCallback, FC } from 'react';
import { useAccount } from 'wagmi';

import Img from 'components/ui/Img';
import Loader from 'components/ui/Loader';
import Modal from 'components/ui/Modal';
import ProgressStepperSlim from 'components/ui/ProgressStepperSlim';
import Text from 'components/ui/Text';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useOnboardingSteps from 'hooks/helpers/useOnboardingSteps';
import useUserTOS from 'hooks/queries/useUserTOS';
import useOnboardingStore from 'store/onboarding/store';

import styles from './ModalOnboarding.module.scss';

const motionAnimationProps: AnimationProps = {
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  initial: { opacity: 0, y: 8 },
  transition: { duration: 0.15, ease: 'easeOut' },
};

const ModalOnboarding: FC = () => {
  const { isConnected } = useAccount();
  const { data: isUserTOSAccepted } = useUserTOS();
  const { setIsOnboardingDone, isOnboardingDone } = useOnboardingStore(state => ({
    isOnboardingDone: state.data.isOnboardingDone,
    setIsOnboardingDone: state.setIsOnboardingDone,
  }));
  const { isDesktop } = useMediaQuery();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isUserTOSAcceptedInitial] = useState(isUserTOSAccepted);

  const stepsToUse = useOnboardingSteps(isUserTOSAcceptedInitial);

  useEffect(() => {
    if (isUserTOSAccepted !== undefined && !isUserTOSAccepted) {
      setIsOnboardingDone(false);
    }

    if (!isUserTOSAcceptedInitial && isUserTOSAccepted) {
      setCurrentStepIndex(prev => prev + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsOnboardingDone, isUserTOSAccepted]);

  const currentStep = stepsToUse.length > 0 ? stepsToUse[currentStepIndex] : null;
  const onOnboardingExit = useCallback(() => {
    if (!isUserTOSAccepted) {
      return;
    }
    setIsOnboardingDone(true);
  }, [setIsOnboardingDone, isUserTOSAccepted]);

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isUserTOSAccepted) {
      return;
    }
    const touchDown = e.touches[0].clientX;

    setTouchStart(touchDown);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart || !isUserTOSAccepted) {
      return;
    }

    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    const touchMoveXDiff = 5;

    const canChangeToNextStep =
      diff >= touchMoveXDiff && currentStepIndex !== stepsToUse.length - 1;
    const canChangeToPrevStep = diff <= -touchMoveXDiff && currentStepIndex > 0;

    if (canChangeToNextStep) {
      setCurrentStepIndex(prev => prev + 1);
    }

    if (canChangeToPrevStep) {
      setCurrentStepIndex(prev => prev - 1);
    }

    setTouchStart(null);
  };

  const handleModalEdgeClick: React.MouseEventHandler<HTMLDivElement> = e => {
    if (!isUserTOSAccepted) {
      return;
    }

    const offsetParent = (e.target as HTMLDivElement).offsetParent as HTMLElement;
    const offsetLeftParent = offsetParent.offsetLeft;
    const onboardingModalWidth = isDesktop
      ? (e.target as HTMLDivElement).offsetParent!.clientWidth!
      : window.innerWidth;
    const { clientX } = e;

    const clickDiff = 25;

    const isLeftEdgeClick = clientX - offsetLeftParent <= clickDiff;
    const isRightEdgeClick =
      Math.abs(clientX - offsetLeftParent - onboardingModalWidth) <= clickDiff;

    const canChangeToPrevStep = isLeftEdgeClick && currentStepIndex > 0;
    const canChangeToNextStep = isRightEdgeClick && currentStepIndex !== stepsToUse.length - 1;

    if (canChangeToNextStep) {
      setCurrentStepIndex(prev => prev + 1);
    }

    if (canChangeToPrevStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (isOnboardingDone) {
      return;
    }

    const listener = ({ key }: KeyboardEvent) => {
      if (key === 'ArrowRight' && currentStepIndex !== stepsToUse.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      }

      if (key === 'ArrowLeft' && currentStepIndex > 0) {
        setCurrentStepIndex(prev => prev - 1);
      }
    };

    if (isUserTOSAccepted) {
      window.addEventListener('keydown', listener);
    }

    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [currentStepIndex, stepsToUse, isOnboardingDone, isUserTOSAccepted]);

  const isModalOpen =
    (isConnected && !isUserTOSAccepted) ||
    (isConnected && !!isUserTOSAccepted && !isOnboardingDone);

  return (
    <Modal
      bodyClassName={styles.onboardingModalBody}
      dataTest="ModalOnboarding"
      header={currentStep?.header}
      headerClassName={styles.onboardingModalHeader}
      Image={
        <div className={styles.onboardingModalImageWrapper}>
          <AnimatePresence mode="wait">
            {currentStep && (
              <motion.div
                key={currentStepIndex}
                {...motionAnimationProps}
                className={cx(styles.onboardingModalImageContainer, currentStep.imageClassName)}
              >
                <Img className={styles.onboardingModalImage} src={currentStep.image} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      }
      isCloseButtonDisabled={!isUserTOSAccepted}
      isOpen={isModalOpen}
      isOverflowOnClickDisabled={!isUserTOSAccepted}
      onClick={handleModalEdgeClick}
      onClosePanel={onOnboardingExit}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <Text className={styles.onboardingModalText}>
        {currentStep ? (
          currentStep.text
        ) : (
          <div className={styles.loaderWrapper}>
            <Loader className={styles.loader} />
          </div>
        )}
      </Text>
      <ProgressStepperSlim
        className={styles.progressBar}
        currentStepIndex={currentStepIndex}
        dataTest="ModalOnboarding__ProgressStepperSlim"
        isDisabled={!isUserTOSAccepted}
        numberOfSteps={stepsToUse.length}
        onStepClick={stepIndex => {
          if (stepIndex === currentStepIndex && stepIndex !== stepsToUse.length - 1) {
            setCurrentStepIndex(stepIndex + 1);
            return;
          }
          setCurrentStepIndex(stepIndex);
        }}
      />
    </Modal>
  );
};

export default ModalOnboarding;
