import React, { FC } from 'react';

import ImgProps from './types';

const Img: FC<ImgProps> = ({ alt = '', ...props }) => <img alt={alt} {...props} />;

export default Img;
