import cx from 'classnames';
import React, { useState, useEffect, useCallback, ReactElement } from 'react';
import { useAccount } from 'wagmi';

import Img from 'components/core/Img/Img';
import Loader from 'components/core/Loader/Loader';
import Modal from 'components/core/Modal/Modal';
import ProgressStepperSlim from 'components/core/ProgressStepperSlim/ProgressStepperSlim';
import Text from 'components/core/Text/Text';
import useGlmClaim from 'hooks/mutations/useGlmClaim';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useGlmClaimCheck from 'hooks/queries/useGlmClaimCheck';
import useOnboardingStore from 'store/onboarding/store';

import styles from './ModalOnboarding.module.scss';
import { getStepsToUse } from './utils';

const ModalOnboarding = (): ReactElement => {
  const { setIsOnboardingDone, isOnboardingDone } = useOnboardingStore(state => ({
    isOnboardingDone: state.data.isOnboardingDone,
    setIsOnboardingDone: state.setIsOnboardingDone,
  }));
  const { isConnected } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: glmClaimCheck, isError, isFetched } = useGlmClaimCheck();
  /**
   * glmClaimMutation sits here to have persistent status ('success' / 'idle') of it
   * required to show disabled button when status === 'success'.
   */
  const glmClaimMutation = useGlmClaim(glmClaimCheck?.value);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const isUserToClaimAvailable = isFetched && !isError && !!glmClaimCheck;
  const isUserEligibleToClaimFetched = isUserToClaimAvailable || (isFetched && isError);
  // Status code 200 & value 0 is an indication that user already claimed.
  const isUserEligibleToClaimGlm = isUserToClaimAvailable && !glmClaimCheck.value.isZero();

  const stepsToUse = getStepsToUse({
    currentEpoch,
    glmClaimCheckValue: glmClaimCheck?.value,
    glmClaimMutation,
    isUserEligibleToClaimFetched,
    isUserEligibleToClaimGlm,
  });
  const currentStep = stepsToUse.length > 0 ? stepsToUse[currentStepIndex] : null;

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
      header={currentStep?.header}
      headerClassName={styles.onboardingModalHeader}
      Image={
        currentStep && (
          <div className={cx(styles.onboardingModalImageWrapper, currentStep.imageClassName)}>
            <Img className={styles.onboardingModalImage} src={currentStep.image} />
          </div>
        )
      }
      isOpen={isConnected && !isOnboardingDone}
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
      {currentStep && (
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
      )}
    </Modal>
  );
};

export default ModalOnboarding;
