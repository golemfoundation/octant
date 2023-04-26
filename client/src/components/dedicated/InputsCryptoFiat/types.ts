import InputTextProps from 'components/core/InputText/types';

export default interface InputsCryptoFiatProps {
  error: string | undefined;
  inputCryptoProps: {
    isDisabled: InputTextProps['isDisabled'];
    name: InputTextProps['name'];
    onChange: InputTextProps['onChange'];
    onClear?: InputTextProps['onClear'];
    suffix: InputTextProps['suffix'];
    value: InputTextProps['value'];
  };
  label: string;
}
