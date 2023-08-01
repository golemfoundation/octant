import InputTextProps from 'components/core/InputText/types';
import { CryptoCurrency } from 'types/cryptoCurrency';

export default interface InputsCryptoFiatProps {
  areInputsDisabled?: boolean;
  cryptoCurrency: CryptoCurrency;
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
