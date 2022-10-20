import React, { FC } from 'react';

import InputTextProps from './types';

const InputText: FC<InputTextProps> = ({ ...props }) => <input type="text" {...props} />;

export default InputText;
