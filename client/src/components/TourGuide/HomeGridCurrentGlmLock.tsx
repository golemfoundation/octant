import React, { ReactElement } from 'react';

import Img from 'components/ui/Img';

const HomeGridCurrentGlmLock = (): ReactElement => {
  return (
    <div>
      <Img src="/images/tourguide/HomeGridCurrentGlmLock.webp" />
      Connect your wallet and click the Lock GLM button. Enter the amount of GLM to lock and confirm
      the transaction in your wallet.
    </div>
  );
};

export default HomeGridCurrentGlmLock;
