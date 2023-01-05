import React, { FC, Fragment } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';

import AllocationInfoBoxesProps from './types';

const AllocationInfoBoxes: FC<AllocationInfoBoxesProps> = ({
  classNameBox,
  isDecisionWindowOpen,
  isConnected,
}) => (
  <Fragment>
    {!isDecisionWindowOpen && (
      <BoxRounded alignment="center" className={classNameBox}>
        The decision window is now closed. Allocating funds is not possible.
      </BoxRounded>
    )}
    {!isConnected && (
      <BoxRounded alignment="center" className={classNameBox}>
        In order to manipulate allocation values and vote, please connect your wallet first.
      </BoxRounded>
    )}
  </Fragment>
);

export default AllocationInfoBoxes;
