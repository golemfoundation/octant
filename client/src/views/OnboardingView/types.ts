import { ReactElement } from 'react';

import { IsOnboardingDonePayload } from 'store/models/onboarding/types';

export interface Step {
  header: string;
  image: string;
  text: ReactElement;
}

export interface DispatchProps {
  setIsOnboardingDone: (payload: IsOnboardingDonePayload) => void;
}

export interface OnboardingViewProps extends DispatchProps {}
