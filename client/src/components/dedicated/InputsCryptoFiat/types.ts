import InputTextProps from 'components/core/InputText/types';

export default interface InputsCryptoFiatProps {
  inputCryptoProps: {
    isDisabled: InputTextProps['isDisabled'];
    label: InputTextProps['label'];
    onChange: InputTextProps['onChange'];
    suffix: InputTextProps['suffix'];
    value: InputTextProps['value'];
  };
}
