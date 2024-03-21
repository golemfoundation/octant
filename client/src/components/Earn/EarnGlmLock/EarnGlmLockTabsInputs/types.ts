import { CurrentMode } from 'components/Earn/EarnGlmLock/types';
import InputTextProps from 'components/ui/InputText/types';
import { CryptoCurrency } from 'types/cryptoCurrency';

export default interface EarnGlmLockTabsInputsProps {
  areInputsDisabled?: boolean;
  cryptoCurrency: CryptoCurrency;
  dataTest?: string;
  error: string | undefined;
  inputCryptoProps: {
    name: InputTextProps['name'];
    onClear?: InputTextProps['onClear'];
    suffix: InputTextProps['suffix'];
    value: InputTextProps['value'];
  };
  label: InputTextProps['label'];
  mode: CurrentMode;
  onChange: (value: string) => void;
  onInputsFocusChange?: (isAnyInputFocused: boolean) => void;
}
