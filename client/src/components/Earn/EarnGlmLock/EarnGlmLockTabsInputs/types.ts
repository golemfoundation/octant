import InputTextProps from 'components/ui/InputText/types';
import { CryptoCurrency } from 'types/cryptoCurrency';

export default interface EarnGlmLockTabsInputsProps {
  areInputsDisabled?: boolean;
  cryptoCurrency: CryptoCurrency;
  dataTest?: string;
  error: string | undefined;
  inputCryptoProps: {
    name: InputTextProps['name'];
    onChange: (value: string) => void;
    onClear?: InputTextProps['onClear'];
    suffix: InputTextProps['suffix'];
    value: InputTextProps['value'];
  };
  label: InputTextProps['label'];
  onInputsFocusChange?: (isAnyInputFocused: boolean) => void;
}
