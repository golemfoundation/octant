import React, { ReactElement } from 'react';

const ProposalsView = (): ReactElement => {
  // @ts-ignore
  const proposalsAddress = import.meta.env.VITE_PROPOSALS_ADDRESS;
  return <div>ProposalsView {proposalsAddress}</div>;
};

export default ProposalsView;
