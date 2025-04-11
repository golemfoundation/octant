import { ReactNode } from 'react';

import ImgProps from 'components/ui/Img/types';

export default interface StepContentProps {
  imgSrc?: ImgProps['src'];
  text: ReactNode | string;
}
