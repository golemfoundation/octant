import React, { useEffect, useMemo, useState } from 'react';

import useMediaQuery from './useMediaQuery';

type UseModalStepperProps = {
  initialCurrentStepIndex?: number;
  steps: any[];
};

type UseModalStepperNavigation = {
  currentStepIndex: number;
  handleModalEdgeClick: React.MouseEventHandler<HTMLDivElement>;
  handleTouchMove: React.TouchEventHandler<HTMLDivElement>;
  handleTouchStart: React.TouchEventHandler<HTMLDivElement>;
  setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>;
};

const useModalStepperNavigation = ({
  steps,
  initialCurrentStepIndex = 0,
}: UseModalStepperProps): UseModalStepperNavigation => {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialCurrentStepIndex);
  const { isDesktop } = useMediaQuery();

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchDown = e.touches[0].clientX;

    setTouchStart(touchDown);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart) {
      return;
    }

    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    const touchMoveXDiff = 5;

    const canChangeToPrevStep = diff <= -touchMoveXDiff && currentStepIndex > 0;
    const canChangeToNextStep = diff >= touchMoveXDiff && currentStepIndex !== steps.length - 1;

    if (canChangeToNextStep) {
      setCurrentStepIndex(prev => prev + 1);
    }

    if (canChangeToPrevStep) {
      setCurrentStepIndex(prev => prev - 1);
    }

    setTouchStart(null);
  };

  const handleModalEdgeClick: React.MouseEventHandler<HTMLDivElement> = e => {
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
    const canChangeToNextStep = isRightEdgeClick && currentStepIndex !== steps.length - 1;

    if (canChangeToNextStep) {
      setCurrentStepIndex(prev => prev + 1);
    }

    if (canChangeToPrevStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    const listener = ({ key }: KeyboardEvent) => {
      if (key === 'ArrowRight' && currentStepIndex !== steps.length - 1) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex]);

  return useMemo(
    () => ({
      currentStepIndex,
      handleModalEdgeClick,
      handleTouchMove,
      handleTouchStart,
      setCurrentStepIndex,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentStepIndex, touchStart],
  );
};

export default useModalStepperNavigation;
