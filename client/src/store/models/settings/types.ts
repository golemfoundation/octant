export interface SettingsStore {
  allocateValueAdjusterUnit?: string;
  areMetricsIntroductionsVisible?: boolean;
  displayCurrency?: 'usd' | 'aud' | 'eur' | 'jpy' | 'cny' | 'gbp';
  isAllocateOnboardingAlwaysVisible?: boolean;
  isCryptoMainValueDisplay?: boolean;
}

export type isCryptoMainValueDisplaySetPayload = NonNullable<
  SettingsStore['isCryptoMainValueDisplay']
>;

export type IsAllocateOnboardingAlwaysVisibleSetPayload = NonNullable<
  SettingsStore['isAllocateOnboardingAlwaysVisible']
>;

export type DisplayCurrencySetPayload = NonNullable<SettingsStore['displayCurrency']>;
