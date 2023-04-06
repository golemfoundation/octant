import React, { FC, Fragment } from 'react';

import Loader from 'components/core/Loader/Loader';

import ProposalLoadingStatesProps from './types';

const ProposalLoadingStates: FC<ProposalLoadingStatesProps> = ({ isLoadingError, isLoading }) => {
  if (isLoadingError) {
    return (
      <Fragment>
        Loading of a proposal
        <br />
        encountered an error.
      </Fragment>
    );
  }
  if (isLoading) {
    return <Loader />;
  }
  return null;
};

export default ProposalLoadingStates;
