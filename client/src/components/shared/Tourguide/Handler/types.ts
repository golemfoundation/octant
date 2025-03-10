import { ReactNode } from 'react';

export type Step = {
  content: {
    imgSrc: string;
    text: ReactNode;
  };
  data?: {
    onAfterStepIsDone?: () => void;
  };
  isAvailable?: boolean;
  target: HTMLElement | null;
  title: string;
};

export type StepsPerView = {
  [key: string]: Step[];
};
