import { OnboardingStore } from 'store/models/onboarding/types';

export interface StateProps {
  isOnboardingDone: OnboardingStore['isOnboardingDone'];
}

export interface RootRoutesProps extends StateProps {}
