import { TFunction } from 'i18next';
import { ReactNode } from 'react';

export type Step = {
  content: {
    imgSrc: string;
    text: ReactNode;
  };
  data?: {
    onAfterStepIsDone?: () => void;
  };
  target: string;
  title: string;
};

export type GetQuickTourSteps = (
  t: TFunction,
  isDecisionWindowOpen: boolean,
  navigate: (path: string) => void,
) => Step[];
