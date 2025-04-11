import cx from 'classnames';
import { AnimatePresence, AnimationProps, motion } from 'framer-motion';
import React, { useState, useEffect, useCallback, ReactElement, useMemo } from 'react';
import { useAccount } from 'wagmi';

import Img from 'components/ui/Img';
import Loader from 'components/ui/Loader';
import Modal from 'components/ui/Modal';
import ProgressStepperSlim from 'components/ui/ProgressStepperSlim';
import Text from 'components/ui/Text';
import { MODAL_ONBOARDING_ID } from 'constants/domElementsIds';
import useModalStepperNavigation from 'hooks/helpers/useModalStepperNavigation';
import useOnboardingSteps from 'hooks/helpers/useOnboardingSteps';
import useAntisybilStatusScore from 'hooks/queries/useAntisybilStatusScore';
import useIsContract from 'hooks/queries/useIsContract';
import useUserTOS from 'hooks/queries/useUserTOS';
import useDelegationStore from 'store/delegation/store';
import useOnboardingStore from 'store/onboarding/store';
import useSettingsStore from 'store/settings/store';

import styles from './ModalOnboarding.module.scss';

const motionAnimationProps: AnimationProps = {
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  initial: { opacity: 0, y: 8 },
  transition: { duration: 0.15, ease: 'easeOut' },
};

const ModalOnboarding = (): ReactElement => {
  const { isConnected } = useAccount();
  const { data: isUserTOSAccepted, isFetching: isFetchingUserTOS } = useUserTOS();
  const { address } = useAccount();

  const [isUserTOSAcceptedInitial, setIsUserTOSAcceptedInitial] = useState(isUserTOSAccepted);

  const { setIsTimeoutListPresenceModalOpen, isTimeoutListPresenceModalOpen } = useDelegationStore(
    state => ({
      isTimeoutListPresenceModalOpen: state.data.isTimeoutListPresenceModalOpen,
      setIsTimeoutListPresenceModalOpen: state.setIsTimeoutListPresenceModalOpen,
    }),
  );
  const {
    setIsOnboardingDone,
    isOnboardingDone,
    hasOnboardingBeenClosed,
    lastSeenStep,
    setLastSeenStep,
    isOnboardingModalOpen,
    setIsOnboardingModalOpen,
    setHasOnboardingBeenClosed,
  } = useOnboardingStore(state => ({
    hasOnboardingBeenClosed: state.data.hasOnboardingBeenClosed,
    isOnboardingDone: state.data.isOnboardingDone,
    isOnboardingModalOpen: state.data.isOnboardingModalOpen,
    lastSeenStep: state.data.lastSeenStep,
    setHasOnboardingBeenClosed: state.setHasOnboardingBeenClosed,
    setIsOnboardingDone: state.setIsOnboardingDone,
    setIsOnboardingModalOpen: state.setIsOnboardingModalOpen,
    setLastSeenStep: state.setLastSeenStep,
  }));
  const { isAllocateOnboardingAlwaysVisible } = useSettingsStore(state => ({
    isAllocateOnboardingAlwaysVisible: state.data.isAllocateOnboardingAlwaysVisible,
  }));
  const { data: isContract } = useIsContract();

  const { data: antisybilStatusScore } = useAntisybilStatusScore(address);

  const stepsToUse = useOnboardingSteps(isUserTOSAcceptedInitial);

  const {
    currentStepIndex,
    setCurrentStepIndex,
    handleModalEdgeClick,
    handleTouchMove,
    handleTouchStart,
  } = useModalStepperNavigation({
    areHandlersEnabled: isConnected && !!isUserTOSAccepted,
    initialCurrentStepIndex: lastSeenStep - 1,
    steps: stepsToUse,
  });

  const shouldOnboardingBeOpened =
    isConnected &&
    (isAllocateOnboardingAlwaysVisible || !isUserTOSAccepted || !hasOnboardingBeenClosed);

  // For multisig users we refetch ToS in a setInternval, so isFetching here causes loop refreshes.
  const currentStep = useMemo(() => {
    if (!stepsToUse.length || (isFetchingUserTOS && !isContract)) {
      return null;
    }
    return stepsToUse[currentStepIndex];
  }, [stepsToUse, currentStepIndex, isFetchingUserTOS, isContract]);

  const onOnboardingExit = useCallback(() => {
    if (!isUserTOSAccepted) {
      return;
    }
    setIsOnboardingModalOpen(false);
    if (!hasOnboardingBeenClosed) {
      setHasOnboardingBeenClosed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsOnboardingDone, isUserTOSAccepted]);

  useEffect(() => {
    if (isOnboardingModalOpen || !antisybilStatusScore || shouldOnboardingBeOpened) {
      return;
    }
    // When user is on the list - open the modal.
    if (
      antisybilStatusScore.isOnTimeOutList &&
      isTimeoutListPresenceModalOpen?.address !== address
    ) {
      setIsTimeoutListPresenceModalOpen({ address: address!, value: true });
    }
    // When user was on the list, but no longer is -- hide the modal.
    if (
      !antisybilStatusScore.isOnTimeOutList &&
      isTimeoutListPresenceModalOpen?.address === address
    ) {
      setIsTimeoutListPresenceModalOpen({ address: address!, value: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    address,
    isOnboardingModalOpen,
    antisybilStatusScore?.isOnTimeOutList,
    shouldOnboardingBeOpened,
  ]);

  useEffect(() => {
    if (shouldOnboardingBeOpened) {
      setIsOnboardingModalOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, shouldOnboardingBeOpened]);

  useEffect(() => {
    if (isOnboardingDone) {
      return;
    }
    const stepNumber = currentStepIndex + 1;
    setLastSeenStep(stepNumber);
    if (stepNumber === stepsToUse.length) {
      setIsOnboardingDone(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex, isOnboardingDone]);

  useEffect(() => {
    if (isOnboardingDone) {
      return;
    }
    setCurrentStepIndex(lastSeenStep - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    /**
     * User should not be able to have LAST_SEEN_STEP more than 0 without having ToS signed.
     * However, whenever ToS is reset (on the backend, or by environment flush),
     * we need to reset LAST_SEEN_STEP to 0 and IS_ONBOARDING_DONE to false.
     */
    if (isUserTOSAccepted === false) {
      setIsOnboardingModalOpen(true);
      setIsOnboardingDone(false);
      setLastSeenStep(0);
      setCurrentStepIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserTOSAccepted]);

  useEffect(() => {
    if (!isUserTOSAcceptedInitial && isUserTOSAccepted) {
      setCurrentStepIndex(prev => prev + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserTOSAccepted]);

  useEffect(() => {
    if (isFetchingUserTOS) {
      return;
    }
    setIsUserTOSAcceptedInitial(isUserTOSAccepted);
    // isUserTOSAccepted mustn't be in deps here, otherwise once TOS is signed initial will flip too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isFetchingUserTOS])

  return (
    <Modal
      bodyClassName={styles.onboardingModalBody}
      dataTest="ModalOnboarding"
      header={currentStep?.header}
      headerClassName={styles.onboardingModalHeader}
      id={MODAL_ONBOARDING_ID}
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
      isOpen={isOnboardingModalOpen}
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
