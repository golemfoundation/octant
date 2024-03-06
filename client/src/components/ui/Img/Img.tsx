import React, { FC, useState, useEffect } from 'react';

import ImgProps from './types';

const Img: FC<ImgProps> = ({ alt = '', dataTest, src, sources, ...props }) => {
  const [srcLocal, setSrcLocal] = useState<string>('');

  useEffect(() => {
    if (src) {
      return setSrcLocal(src);
    }
    if (sources) {
      return setSrcLocal(sources[0]);
    }
    return setSrcLocal('');
  }, [src, sources]);

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
