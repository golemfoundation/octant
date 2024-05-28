import cx from 'classnames';
import { motion } from 'framer-motion';
import React, { ReactElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Img from 'components/ui/Img';
import Svg from 'components/ui/Svg';
import Tooltip from 'components/ui/Tooltip';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useOnboardingSteps from 'hooks/helpers/useOnboardingSteps';
import useUserTOS from 'hooks/queries/useUserTOS';
import useOnboardingStore from 'store/onboarding/store';
import { four, one, three, two } from 'svg/onboardingStepper';

import styles from './OnboardingStepper.module.scss';

const OnboardingStepper = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'components.shared.onboardingStepper' });
  const { setIsOnboardingModalOpen, lastSeenStep } = useOnboardingStore(state => ({
    isOnboardingModalOpen: state.data.isOnboardingModalOpen,
    lastSeenStep: state.data.lastSeenStep,
    setIsOnboardingModalOpen: state.setIsOnboardingModalOpen,
  }));

  const { isDesktop } = useMediaQuery();
  const { data: isUserTOSAccepted } = useUserTOS();
  const [isUserTOSAcceptedInitial] = useState(isUserTOSAccepted);
  const stepsToUse = useOnboardingSteps(isUserTOSAcceptedInitial);
  const cxcy = 28;
  const viewBox = '0 0 56 56';
  const numberOfSteps = stepsToUse.length;

  const animationProps = isDesktop
    ? {
        animate: { bottom: 48, opacity: 1, right: 48 },
        exit: { bottom: 24, opacity: 0, right: 48 },
        initial: { bottom: 24, opacity: 0, right: 48 },
      }
    : {
        animate: { bottom: 116, opacity: 1, right: 24 },
        exit: { bottom: 92, opacity: 0, right: 24 },
        initial: { bottom: 92, opacity: 0, right: 24 },
      };

  const svgNumber = useMemo(() => {
    if (lastSeenStep === 1) {
      return one;
    }
    if (lastSeenStep === 2) {
      return two;
    }
    if (lastSeenStep === 3) {
      return three;
    }
    return four;
  }, [lastSeenStep]);

  return (
    <motion.div
      key="OnboardingStepper"
      className={styles.root}
      data-test="OnboardingStepper"
      onClick={() => setIsOnboardingModalOpen(true)}
      whileHover={{ scale: 1.1 }}
      {...animationProps}
    >
      <Tooltip
        childrenClassName={styles.tooltipChildrenClassname}
        className={styles.tooltip}
        dataTest="OnboardingStepper__Tooltip"
        position="top"
        text={t('reopenOnboarding')}
        variant="small"
      >
        <div className={styles.wrapper}>
          <Img className={styles.slideImg} src="/images/slide.webp" />
          <Svg classNameSvg={styles.stepNumber} img={svgNumber} size={1.2} />
          <svg className={styles.backgroundCircleSvg} viewBox={viewBox}>
            <circle className={styles.backgroundCircle} cx={cxcy} cy={cxcy} r={28} />
          </svg>
          <motion.svg
            key={`stepper--${numberOfSteps}`}
            className={styles.progressLinesSvg}
            viewBox={viewBox}
          >
            {[...Array(numberOfSteps).keys()].map(i => (
              <motion.circle
                key={`progressLine--${i}`}
                animate={{
                  pathLength: 1 / numberOfSteps - 0.02,
                  rotate: -86 + (360 / numberOfSteps) * i,
                }}
                className={cx(styles.progressLine, i < lastSeenStep && styles.isHighlighted)}
                cx={cxcy}
                cy={cxcy}
                data-test={`OnboardingStepper__circle--${i}`}
                initial={{
                  pathLength: 1 / numberOfSteps - 0.02,
                  rotate: 0,
                }}
                r={27}
                transition={{ duration: 0.01 }}
              />
            ))}
          </motion.svg>
        </div>
      </Tooltip>
    </motion.div>
  );
};

export default OnboardingStepper;
