import {
  DisplayCurrencySetPayload,
  IsAllocateOnboardingAlwaysVisibleSetPayload,
  isCryptoMainValueDisplaySetPayload,
  SettingsStore,
} from 'store/models/settings/types';

export interface StateProps {
  displayCurrency: SettingsStore['displayCurrency'];
  isAllocateOnboardingAlwaysVisible: SettingsStore['isAllocateOnboardingAlwaysVisible'];
  isCryptoMainValueDisplay: SettingsStore['isCryptoMainValueDisplay'];
}

export interface DispatchProps {
  setDisplayCurrency: (payload: DisplayCurrencySetPayload) => void;
  setIsAllocateOnboardingAlwaysVisible: (
    payload: IsAllocateOnboardingAlwaysVisibleSetPayload,
  ) => void;
  setIsCryptoMainValueDisplay: (payload: isCryptoMainValueDisplaySetPayload) => void;
}

export default interface SettingsViewProps extends StateProps, DispatchProps {}
