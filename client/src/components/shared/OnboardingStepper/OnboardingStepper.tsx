import cx from 'classnames';
import React, { FC, useMemo, useState } from 'react';
import useOnboardingStore from 'store/onboarding/store';

import { motion } from 'framer-motion';
import styles from './OnboardingStepper.module.scss';
import useOnboardingSteps from 'hooks/helpers/useOnboardingSteps';
import useUserTOS from 'hooks/queries/useUserTOS';
import Svg from 'components/ui/Svg';
import { four, one, three, two } from 'svg/onboardingStepper';
import Tooltip from 'components/ui/Tooltip';

const OnboardingStepper: FC<{ className?: string }> = ({ className }) => {
  const { setIsOnboardingModalOpen, lastSeenStep } = useOnboardingStore(state => ({
    isOnboardingModalOpen: state.data.isOnboardingModalOpen,
    setIsOnboardingModalOpen: state.setIsOnboardingModalOpen,
    lastSeenStep: state.data.lastSeenStep,
  }));

  const { data: isUserTOSAccepted } = useUserTOS();
  const [isUserTOSAcceptedInitial] = useState(isUserTOSAccepted);
  const stepsToUse = useOnboardingSteps(isUserTOSAcceptedInitial);
  const cxcy = 28;
  const viewBox = '0 0 56 56';
  const numberOfSteps = stepsToUse.length;

  const svgNumber = useMemo(() => {
    if (lastSeenStep === 1) return one;
    if (lastSeenStep === 2) return two;
    if (lastSeenStep === 3) return three;
    return four;
  }, [lastSeenStep]);

  return (
    <div className={styles.root}>
      <Tooltip variant="small" position="top" text="Reopen onboarding">
        <div className={styles.wrapper}>
          <img src="images/slide.png" className={styles.slideImg} />
          <Svg img={svgNumber} size={1.2} classNameSvg={styles.stepNumber} />
          <svg className={styles.backgroundCircleSvg} viewBox={viewBox}>
            <circle className={styles.backgroundCircle} cx={cxcy} cy={cxcy} r={28}></circle>
          </svg>
          <motion.svg
            className={styles.progressLinesSvg}
            viewBox={viewBox}
            key={`stepper--${numberOfSteps}`}
            onClick={() => setIsOnboardingModalOpen(true)}
          >
            {[...Array(numberOfSteps).keys()].map(i => (
              <motion.circle
                key={`progressLine--${i}`}
                className={cx(styles.progressLine, i < lastSeenStep && styles.isHighlighted)}
                cx={cxcy}
                cy={cxcy}
                r={27}
                initial={{
                  pathLength: 1 / numberOfSteps - 0.02,
                  rotate: -86 + (360 / numberOfSteps) * i,
                }}
              />
            ))}
          </motion.svg>
        </div>
      </Tooltip>
    </div>
  );
};

export default OnboardingStepper;
