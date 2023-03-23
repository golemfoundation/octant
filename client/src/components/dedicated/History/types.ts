import { SettingsStore } from 'store/models/settings/types';

export interface StateProps {
  displayCurrency: NonNullable<SettingsStore['displayCurrency']>;
  isCryptoMainValueDisplay: NonNullable<SettingsStore['isCryptoMainValueDisplay']>;
}

export default interface HistoryProps extends StateProps {}
