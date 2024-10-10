import { DisplayCurrencies } from 'constants/currencies';

type Option = {
  label: Uppercase<DisplayCurrencies>;
  value: DisplayCurrencies;
};

export type Options = Option[];
