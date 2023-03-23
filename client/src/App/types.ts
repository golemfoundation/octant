import { AllocationsAddPayload, AllocationsStore } from 'store/models/allocations/types';
import { OnboardingStore } from 'store/models/onboarding/types';
import { isCryptoMainValueDisplaySetPayload, SettingsStore } from 'store/models/settings/types';

export interface StateProps {
  allocations: AllocationsStore;
  onboarding: OnboardingStore;
  settings: SettingsStore;
}

export interface DispatchProps {
  onDefaultValuesFromLocalStorageSetOnboarding: () => void;
  onDefaultValuesFromLocalStorageSetSettings: () => void;
  onSetAllocations: (payload: AllocationsAddPayload) => void;
  setIsCryptoMainValueDisplay: (payload: isCryptoMainValueDisplaySetPayload) => void;
}

export default interface AppProps extends StateProps, DispatchProps {}
