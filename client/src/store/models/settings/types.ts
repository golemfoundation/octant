export interface SettingsStore {
  allocateValueAdjusterUnit?: string;
  areMetricsIntroductionsVisible?: boolean;
  displayCurrency?: string;
  isAllocateOnboardingAlwaysVisible?: boolean;
  isEthMainValueDisplay?: boolean;
}

export type IsAllocateOnboardingAlwaysVisibleSetPayload =
  SettingsStore['isAllocateOnboardingAlwaysVisible'];
