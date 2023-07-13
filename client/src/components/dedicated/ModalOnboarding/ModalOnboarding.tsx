import React, { useState, useEffect, useCallback, ReactElement } from 'react';
import { useAccount } from 'wagmi';

import Img from 'components/core/Img/Img';
import Modal from 'components/core/Modal/Modal';
import ProgressStepperSlim from 'components/core/ProgressStepperSlim/ProgressStepperSlim';
import Text from 'components/core/Text/Text';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useOnboardingStore from 'store/onboarding/store';

import styles from './ModalOnboarding.module.scss';
import steps from './steps';
import stepsEpoch1 from './stepsEpoch1';

const ModalOnboarding = (): ReactElement => {
  const { setIsOnboardingDone, isOnboardingDone } = useOnboardingStore(state => ({
    isOnboardingDone: state.data.isOnboardingDone,
    setIsOnboardingDone: state.setIsOnboardingDone,
  }));

  const { isConnected } = useAccount();

  const { data: currentEpoch } = useCurrentEpoch();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const stepsToUse = currentEpoch === 1 ? stepsEpoch1 : steps;
  const currentStep = stepsToUse[currentStepIndex];

  const onOnboardingExit = useCallback(() => {
    setIsOnboardingDone(true);
  }, [setIsOnboardingDone]);

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchDown = e.touches[0].clientX;
    const touchStartXDiff = 15;

    const canChangeToNextStep =
      window.innerWidth - touchDown <= touchStartXDiff &&
      currentStepIndex !== stepsToUse.length - 1;
    const canChangeToPrevStep = touchDown <= touchStartXDiff && currentStepIndex > 0;

    if (canChangeToNextStep) {
      setCurrentStepIndex(currentStepIndex + 1);
      return;
    }

    if (canChangeToPrevStep) {
      setCurrentStepIndex(currentStepIndex - 1);
      return;
    }

    setTouchStart(touchDown);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart) {
      return;
    }

    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    const touchMoveXDiff = 5;

    const canChangeToNextStep =
      diff >= touchMoveXDiff && currentStepIndex !== stepsToUse.length - 1;
    const canChangeToPrevStep = diff <= -touchMoveXDiff && currentStepIndex > 0;

    if (canChangeToNextStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    }

    if (canChangeToPrevStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }

    setTouchStart(null);
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

    window.addEventListener('keydown', listener);

    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [currentStepIndex, stepsToUse, isOnboardingDone]);

  return (
    <Modal
      bodyClassName={styles.onboardingModalBody}
      dataTest="ModalOnboarding"
      header={currentStep.header}
      headerClassName={styles.onboardingModalHeader}
      Image={
        <div className={styles.onboardingModalImageWrapper}>
          <Img className={styles.onboardingModalImage} src={currentStep.image} />
        </div>
      }
      isOpen={isConnected && !isOnboardingDone}
      onClosePanel={onOnboardingExit}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <Text className={styles.onboardingModalText}>{currentStep.text}</Text>
      <ProgressStepperSlim
        className={styles.progressBar}
        currentStepIndex={currentStepIndex}
        dataTest="ModalOnboarding__ProgressStepperSlim"
        numberOfSteps={stepsToUse.length}
        onStepClick={stepIndex => {
          if (stepIndex === currentStepIndex) {
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
