import React, { ReactElement, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import MetricsGrid from 'components/Metrics/MetricsGrid';
import MetricsHeader from 'components/Metrics/MetricsHeader';
import TipTile from 'components/shared/TipTile';
import { METRICS_PERSONAL_ID } from 'constants/domElementsIds';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useMetricsPersonalDataRewardsUsage from 'hooks/helpers/useMetricsPersonalDataRewardsUsage';
import useTotalPatronDonations from 'hooks/helpers/useTotalPatronDonations';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useSettingsStore from 'store/settings/store';

import styles from './MetricsPersonal.module.scss';
import MetricsPersonalGridAllocations from './MetricsPersonalGridAllocations';
import MetricsPersonalGridDonationsProgressBar from './MetricsPersonalGridDonationsProgressBar';
import MetricsPersonalGridPatronDonations from './MetricsPersonalGridPatronDonations';
import MetricsPersonalGridTotalRewardsWithdrawals from './MetricsPersonalGridTotalRewardsWithdrawals';

const MetricsPersonal = (): ReactElement => {
  const { isConnected } = useAccount();
  const { isDesktop } = useMediaQuery();
  const [isConnectWalletTipTileOpen, setIsConnectWalletTipTileOpen] = useState(!isConnected);
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const {
    data: { displayCurrency },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
    },
  }));
  const { isFetching: isFetchingCryptoValues } = useCryptoValues(displayCurrency);
  const { isFetching: isFetchingMetricsPersonalDataRewardsUsage } =
    useMetricsPersonalDataRewardsUsage();
  const { data: totalPatronDonations, isFetching: isFetchingTotalPatronDonations } =
    useTotalPatronDonations();

  const isLoading =
    isFetchingCryptoValues ||
    isFetchingMetricsPersonalDataRewardsUsage ||
    isFetchingTotalPatronDonations;

  const wasUserEverAPatron = totalPatronDonations && totalPatronDonations.numberOfEpochs > 0;

  return (
    <div className={styles.root} id={METRICS_PERSONAL_ID}>
      <div className={styles.divider} />
      <MetricsHeader title={t('yourMetrics')} />
      {isConnected ? (
        <MetricsGrid className={styles.grid} dataTest="MetricsPersonal__MetricsGrid">
          <MetricsPersonalGridAllocations
            isLoading={isLoading}
            size={isDesktop && wasUserEverAPatron ? 'custom' : 'L'}
          />
          <MetricsPersonalGridTotalRewardsWithdrawals isLoading={isLoading} />
          <MetricsPersonalGridDonationsProgressBar isLoading={isLoading} />
          {wasUserEverAPatron && (
            <MetricsPersonalGridPatronDonations
              isLoading={isLoading}
              numberOfEpochs={totalPatronDonations.numberOfEpochs}
              value={totalPatronDonations.value}
            />
          )}
        </MetricsGrid>
      ) : (
        <TipTile
          dataTest="MetricsPersonal__TipTile--connectWallet"
          image="images/tip-connect-wallet.webp"
          imageClassName={styles.connectWalletImage}
          isOpen={isConnectWalletTipTileOpen}
          onClose={() => setIsConnectWalletTipTileOpen(false)}
          text={
            <Trans
              // eslint-disable-next-line react/jsx-no-useless-fragment
              components={[isDesktop ? <br /> : <></>]}
              i18nKey="views.metrics.connectWalletTip.text"
            />
          }
          title={t('connectWalletTip.title')}
        />
      )}
    </div>
  );
};

export default MetricsPersonal;
