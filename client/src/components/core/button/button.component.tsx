import React, { FC } from 'react';

import ButtonProps from './types';

const Button: FC<ButtonProps> = ({ children, label, onClick, type = 'button' }) => (
  <button
    onClick={onClick}
    // eslint-disable-next-line react/button-has-type
    type={type}
  >
    {children}
    {label}
  </button>
);

export default Button;
