import InputTextProps from 'components/core/InputText/types';
import { CryptoCurrency } from 'types/cryptoCurrency';

export default interface InputsCryptoFiatProps {
  cryptoCurrency: CryptoCurrency;
  error: string | undefined;
  inputCryptoProps: {
    isDisabled: InputTextProps['isDisabled'];
    name: InputTextProps['name'];
    onChange: (value: string) => void;
    onClear?: InputTextProps['onClear'];
    suffix: InputTextProps['suffix'];
    value: InputTextProps['value'];
  };
  label: string;

  onInputsFocusChange?: (isAnyInputFocused: boolean) => void;
}
