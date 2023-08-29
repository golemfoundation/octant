import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import ProposalLoadingStatesProps from './types';

const ProposalLoadingStates: FC<ProposalLoadingStatesProps> = ({
  isLoadingError,
  isLoading,
  children,
}) => {
  if (isLoadingError) {
    return <Trans i18nKey="components.dedicated.proposalLoadingStates.text" />;
  }
  if (isLoading) {
    return children;
  }
  return null;
};

export default ProposalLoadingStates;
