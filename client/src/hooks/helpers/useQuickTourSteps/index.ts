import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';

import { getQuickTourSteps } from './steps';
import { Step } from './types';

export default function useQuickTourSteps(): Step[] {
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const navigate = useNavigate();
  const { t } = useTranslation('translation', {
    keyPrefix: 'tourGuide',
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => getQuickTourSteps(t, isDecisionWindowOpen!, navigate), [isDecisionWindowOpen]);
}
