import React, { FC } from 'react';

import ImgProps from './types';

const Img: FC<ImgProps> = ({ alt = '', dataTest, ...props }) => (
  <img alt={alt} data-test={dataTest} {...props} />
);

export default Img;
