import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import ProposalItemSkeleton from 'components/dedicated/ProposalItemSkeleton/ProposalItemSkeleton';

import ProposalLoadingStatesProps from './types';

const ProposalLoadingStates: FC<ProposalLoadingStatesProps> = ({ isLoadingError, isLoading }) => {
  if (isLoadingError) {
    return <Trans i18nKey="components.dedicated.proposalLoadingStates.text" />;
  }
  if (isLoading) {
    return <ProposalItemSkeleton />;
  }
  return null;
};

export default ProposalLoadingStates;
