import { TFunction } from 'i18next';
import { ReactNode } from 'react';

import { LayoutMethods } from 'store/layout/types';

export type Step = {
  content: {
    imgSrc: string;
    text: ReactNode;
  };
  data?: {
    onAfterStepIsDone?: () => void;
    onStepPrev?: () => void;
  };
  target: string;
  title: string;
};

export type GetQuickTourSteps = (
  t: TFunction,
  isDecisionWindowOpen: boolean,
  navigate: (path: string) => void,
  setIsAllocationDrawerOpen: LayoutMethods['setIsSettingsDrawerOpen'],
) => Step[];
