import {
  IsAllocateOnboardingAlwaysVisibleSetPayload,
  SettingsStore,
} from 'store/models/settings/types';

export interface StateProps {
  isAllocateOnboardingAlwaysVisible: SettingsStore['isAllocateOnboardingAlwaysVisible'];
}

export interface DispatchProps {
  setIsAllocateOnboardingAlwaysVisible: (
    payload: IsAllocateOnboardingAlwaysVisibleSetPayload,
  ) => void;
}

export default interface SettingsViewProps extends StateProps, DispatchProps {}
