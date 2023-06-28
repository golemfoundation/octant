import { minidenticon } from 'minidenticons';
import React, { FC } from 'react';

import IdenticonProps from './types';

const Identicon: FC<IdenticonProps> = ({ className, username }) => {
  const identiconSvg = minidenticon(username);
  return (
    <div
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __html: identiconSvg,
      }}
    />
  );
};

export default Identicon;
