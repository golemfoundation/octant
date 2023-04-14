import InputTextProps from 'components/core/InputText/types';

export default interface InputsCryptoFiatProps {
  inputCryptoProps: {
    isDisabled: InputTextProps['isDisabled'];
    onChange: InputTextProps['onChange'];
    suffix: InputTextProps['suffix'];
    value: InputTextProps['value'];
  };
  label: string;
}
