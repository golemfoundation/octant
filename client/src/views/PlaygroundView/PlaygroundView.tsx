import React, { ReactElement, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';

import Layout from 'components/shared/Layout';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import getTimeDistance from 'utils/getTimeDistance';

const PlaygroundView = (): ReactElement => {
  const { timeCurrentAllocationEnd, timeCurrentEpochEnd } = useEpochAndAllocationTimestamps();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const getCurrentPeriod = () => {
    if (isDecisionWindowOpen && timeCurrentAllocationEnd) {
      return getTimeDistance(Date.now(), new Date(timeCurrentAllocationEnd).getTime());
    }
    if (!isDecisionWindowOpen && timeCurrentEpochEnd) {
      return getTimeDistance(Date.now(), new Date(timeCurrentEpochEnd).getTime());
    }
    return '';
  };
  const [currentPeriod, setCurrentPeriod] = useState(() => getCurrentPeriod());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPeriod(getCurrentPeriod());
    }, 1000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [isDecisionWindowOpen, timeCurrentAllocationEnd, timeCurrentEpochEnd]);

  return (
    <Layout>
      <div style={{ fontSize: '120px' }}>
        <Trans
          components={[<span />]}
          i18nKey={
            isDecisionWindowOpen
              ? 'layouts.main.allocationEndsIn'
              : 'layouts.main.allocationStartsIn'
          }
          values={{ currentPeriod }}
        />
      </div>
    </Layout>
  );
};

export default PlaygroundView;
