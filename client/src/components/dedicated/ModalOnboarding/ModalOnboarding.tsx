import cx from 'classnames';
import React, { useState, useEffect, useCallback, FC } from 'react';
import { useAccount } from 'wagmi';

import Img from 'components/core/Img/Img';
import Loader from 'components/core/Loader/Loader';
import Modal from 'components/core/Modal/Modal';
import ProgressStepperSlim from 'components/core/ProgressStepperSlim/ProgressStepperSlim';
import Text from 'components/core/Text/Text';
import useOnboardingSteps from 'hooks/helpers/useOnboardingSteps';
import useUserTOS from 'hooks/queries/useUserTOS';
import useOnboardingStore from 'store/onboarding/store';

import styles from './ModalOnboarding.module.scss';

const ModalOnboarding: FC = () => {
  const { data: isUserTOSAccepted } = useUserTOS();
  const { setIsOnboardingDone, isOnboardingDone } = useOnboardingStore(state => ({
    isOnboardingDone: state.data.isOnboardingDone,
    setIsOnboardingDone: state.setIsOnboardingDone,
  }));
  const { isConnected } = useAccount();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const stepsToUse = useOnboardingSteps(isOnboardingDone);

  useEffect(() => {
    if (!isUserTOSAccepted) {
      setIsOnboardingDone(false);
    }
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
        currentStep && (
          <div className={cx(styles.onboardingModalImageWrapper, currentStep.imageClassName)}>
            <Img className={styles.onboardingModalImage} src={currentStep.image} />
          </div>
        )
      }
      isCloseButtonDisabled={!isUserTOSAccepted}
      isOpen={isModalOpen}
      isOverflowOnClickDisabled={!isUserTOSAccepted}
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
