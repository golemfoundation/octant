import { AllocationsStore } from './allocations/types';
import { OnboardingStore } from './onboarding/types';
import { SettingsStore } from './settings/types';

export interface ModelsStore {
  allocations: AllocationsStore;
  onboarding: OnboardingStore;
  settings: SettingsStore;
}
