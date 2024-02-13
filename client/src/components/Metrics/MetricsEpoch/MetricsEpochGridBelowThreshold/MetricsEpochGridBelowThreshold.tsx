import { BigNumber } from 'ethers';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import { getValuesToDisplay } from 'components/ui/DoubleValue/utils';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useProposalsDonors from 'hooks/queries/donors/useProposalsDonors';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';
import i18n from 'i18n';
import useSettingsStore from 'store/settings/store';

import MetricsEpochGridBelowThresholdProps from './types';

const MetricsEpochGridBelowThreshold: FC<MetricsEpochGridBelowThresholdProps> = ({
  isLoading,
  className,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const {
    data: { displayCurrency },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { epoch, lastEpoch } = useMetricsEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);
  const { data: matchedProposalRewards } = useMatchedProposalRewards(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );
  const { data: proposalsDonors } = useProposalsDonors(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );

  const { data: proposalRewardsThreshold } = useProposalRewardsThreshold(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );

  const projectsBelowThreshold =
    Object.keys(proposalsDonors).length -
    (matchedProposalRewards?.filter(({ matched }) => !matched.isZero()).length || 0);

  const ethBelowThreshold =
    proposalRewardsThreshold === undefined
      ? BigNumber.from(0)
      : Object.values(proposalsDonors).reduce((acc, curr) => {
          const projectSumOfDonations = curr.reduce((acc2, curr2) => {
            return acc2.add(curr2.amount);
          }, BigNumber.from(0));

          if (projectSumOfDonations.lt(proposalRewardsThreshold)) {
            return acc.add(projectSumOfDonations);
          }

          return acc;
        }, BigNumber.from(0));

  const ethBelowThresholdToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    cryptoValues,
    displayCurrency: displayCurrency!,
    error,
    isCryptoMainValueDisplay: true,
    shouldIgnoreGwei: false,
    valueCrypto: ethBelowThreshold,
  });

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridBelowThreshold"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={i18n.t('common.projects').toUpperCase()}
              value={projectsBelowThreshold.toString()}
            />
          ),
          title: t('belowThreshold'),
        },
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={ethBelowThresholdToDisplay.secondary}
              value={ethBelowThresholdToDisplay.primary}
            />
          ),
          title: t('ethBelowThreshold'),
        },
      ]}
      size="M"
    />
  );
};

export default MetricsEpochGridBelowThreshold;
