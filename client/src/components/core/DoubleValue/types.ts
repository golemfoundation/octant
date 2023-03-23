import { BigNumber } from 'ethers';

import { SettingsStore } from 'store/models/settings/types';

export const DOUBLE_VALUE_VARIANTS = ['standard', 'small'];
export type DoubleValueVariant = (typeof DOUBLE_VALUE_VARIANTS)[number];

export interface OwnProps {
  className?: string;
  cryptoCurrency?: 'golem' | 'ethereum';
  valueCrypto?: BigNumber;
  valueString?: string;
  variant?: DoubleValueVariant;
}

export interface StateProps {
  displayCurrency: NonNullable<SettingsStore['displayCurrency']>;
  isCryptoMainValueDisplay: NonNullable<SettingsStore['isCryptoMainValueDisplay']>;
}

export default interface DoubleValueProps extends OwnProps, StateProps {}
