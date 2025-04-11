import React from 'react';
import { Trans } from 'react-i18next';

import styles from 'components/shared/QuickTour/Handler/Handler.module.scss';
import {
  TOURGUIDE_ELEMENT_2,
  TOURGUIDE_ELEMENT_1,
  TOURGUIDE_ELEMENT_10_11,
  TOURGUIDE_ELEMENT_3,
  TOURGUIDE_ELEMENT_4,
  TOURGUIDE_ELEMENT_5,
  TOURGUIDE_ELEMENT_6,
  TOURGUIDE_ELEMENT_7,
  TOURGUIDE_ELEMENT_8,
  TOURGUIDE_ELEMENT_9,
} from 'constants/domElementsIds';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';

import { GetQuickTourSteps } from './types';

export const getQuickTourSteps: GetQuickTourSteps = (t, isDecisionWindowOpen, navigate) => {
  return [
    {
      content: {
        imgSrc: '/images/tourguide/1.gif',
        text: (
          <Trans components={[<span className={styles.bold} />]} i18nKey="tourGuide.step1.text" />
        ),
      },
      target: `#${TOURGUIDE_ELEMENT_1}`,
      title: t('step1.title'),
    },
    {
      content: {
        imgSrc: '/images/tourguide/2.gif',
        text: t('step2.text'),
      },
      target: `#${TOURGUIDE_ELEMENT_2}`,
      title: t('step2.title'),
    },
    {
      content: {
        imgSrc: '/images/tourguide/3.gif',
        text: t('step3.text'),
      },
      target: `#${TOURGUIDE_ELEMENT_3}`,
      title: t('step3.title'),
    },
    {
      content: {
        imgSrc: '/images/tourguide/4.webp',
        text: t('step4.text'),
      },
      target: `#${TOURGUIDE_ELEMENT_4}`,
      title: t('step4.title'),
    },
    {
      content: {
        imgSrc: '/images/tourguide/5.gif',
        text: t('step5.text'),
      },
      target: `#${TOURGUIDE_ELEMENT_5}`,
      title: t('step5.title'),
    },
    {
      content: {
        imgSrc: '/images/tourguide/6.gif',
        text: t('step6.text'),
      },
      data: {
        onAfterStepIsDone: () =>
          navigate(
            isDecisionWindowOpen ? ROOT_ROUTES.projects.absolute : ROOT_ROUTES.metrics.absolute,
          ),
      },
      target: `#${TOURGUIDE_ELEMENT_6}`,
      title: t('step6.title'),
    },
    ...(isDecisionWindowOpen
      ? [
          {
            content: {
              imgSrc: '/images/tourguide/7.gif',
              text: t('step7.text'),
            },
            data: {
              onAfterStepIsDone: () => navigate(ROOT_ROUTES.metrics.absolute),
            },
            target: `#${TOURGUIDE_ELEMENT_7}`,
            title: t('step7.title'),
          },
        ]
      : []),
    {
      content: {
        imgSrc: '/images/tourguide/8.gif',
        text: t('step8.text'),
      },
      target: `#${TOURGUIDE_ELEMENT_8}`,
      title: t('step8.title'),
    },
    {
      content: {
        imgSrc: '/images/tourguide/9.gif',
        text: t('step9.text'),
      },
      data: isDecisionWindowOpen
        ? {
            onAfterStepIsDone: () => navigate(ROOT_ROUTES.allocation.absolute),
          }
        : undefined,
      target: `#${TOURGUIDE_ELEMENT_9}`,
      title: t('step9.title'),
    },
    ...(isDecisionWindowOpen
      ? [
          {
            content: {
              imgSrc: '/images/tourguide/10.gif',
              text: t('step10.text'),
            },
            target: `#${TOURGUIDE_ELEMENT_10_11}`,
            title: t('step10.title'),
          },
          {
            content: {
              imgSrc: '/images/tourguide/11.gif',
              text: t('step11.text'),
            },
            target: `#${TOURGUIDE_ELEMENT_10_11}`,
            title: t('step11.title'),
          },
        ]
      : []),
  ];
};
