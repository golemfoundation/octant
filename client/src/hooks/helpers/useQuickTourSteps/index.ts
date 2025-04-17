import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useLayoutStore from 'store/layout/store';

import { getQuickTourSteps } from './steps';
import { Step } from './types';

export default function useQuickTourSteps(): Step[] {
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { setIsAllocationDrawerOpen } = useLayoutStore(state => ({
    setIsAllocationDrawerOpen: state.setIsAllocationDrawerOpen,
  }));

  const navigate = useNavigate();
  const { t } = useTranslation('translation', {
    keyPrefix: 'tourGuide',
  });

  return useMemo(
    () => getQuickTourSteps(t, isDecisionWindowOpen!, navigate, setIsAllocationDrawerOpen),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDecisionWindowOpen],
  );
}
