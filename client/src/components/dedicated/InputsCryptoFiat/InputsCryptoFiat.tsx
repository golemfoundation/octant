import React, { FC } from 'react';

import InputText from 'components/core/InputText/InputText';

import styles from './InputsCryptoFiat.module.scss';
import InputsCryptoFiatProps from './types';

const InputsCryptoFiat: FC<InputsCryptoFiatProps> = ({ inputCryptoProps }) => (
  <div className={styles.root}>
    <InputText className={styles.input} placeholder="0.00" variant="simple" {...inputCryptoProps} />
    <InputText
      className={styles.input}
      isDisabled
      placeholder="0.00"
      suffix="USD"
      variant="simple"
    />
  </div>
);

export default InputsCryptoFiat;
