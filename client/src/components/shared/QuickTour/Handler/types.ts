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
