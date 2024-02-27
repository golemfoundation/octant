import React, { FC, useState } from 'react';

import ImgProps from './types';

const Img: FC<ImgProps> = ({ alt = '', dataTest, src, sources, ...props }) => {
  const getSrcLocal = () => {
    if (src) {
      return src;
    }
    if (sources) {
      return sources[0];
    }
    return '';
  };

  const [srcLocal, setSrcLocal] = useState<string>(getSrcLocal());

  return (
    <img
      alt={alt}
      data-test={dataTest}
      onError={() => {
        if (src !== undefined || !sources) {
          return;
        }

        const indexOfCurrentSource = sources.indexOf(srcLocal);

        if (sources.indexOf(srcLocal) < sources.length - 1) {
          setSrcLocal(sources[indexOfCurrentSource + 1]);
        }
      }}
      src={srcLocal}
      {...props}
    />
  );
};

export default Img;
