import cx from 'classnames';
import React, { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import TransactionDetailsDateAndTime from 'components/Home/HomeGridTransactions/ModalTransactionDetails/TransactionDetails/TransactionDetailsDateAndTime';
import ProjectAllocationDetailRow from 'components/shared/ProjectAllocationDetailRow';
import BoxRounded from 'components/ui/BoxRounded';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/ui/BoxRounded/Sections/types';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useEpochLeverage from 'hooks/queries/useEpochLeverage';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useEpochTimestampHappenedIn from 'hooks/subgraph/useEpochTimestampHappenedIn';
import { CryptoCurrency } from 'types/cryptoCurrency';

import styles from './TransactionDetailsAllocation.module.scss';
import TransactionDetailsAllocationProps from './types';

const TransactionDetailsAllocation: FC<TransactionDetailsAllocationProps> = ({
  eventData: { amount, allocations, leverage },
  timestamp,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridTransactions.modalTransactionDetails',
  });
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: epochTimestampHappenedIn, isFetching: isFetchingEpochTimestampHappenedIn } =
    useEpochTimestampHappenedIn(timestamp);

  const getValuesToDisplay = useGetValuesToDisplay();

  const allocationEpoch = epochTimestampHappenedIn ? epochTimestampHappenedIn - 1 : undefined;

  const { data: epochLeverage, isFetching: isFetchingEpochLeverage } =
    useEpochLeverage(allocationEpoch);

  const { data: individualReward, isFetching: isFetchingIndividualReward } =
    useIndividualReward(allocationEpoch);

  const isPersonalOnlyAllocation = amount === 0n;

  const isAllocationFromCurrentAW = currentEpoch
    ? isDecisionWindowOpen && allocationEpoch === currentEpoch - 1
    : false;

  /**
   * leverage in the event is a value from the moment event happened.
   * When event happened in the already closed AW we show epochLeverage, as it's the final one.
   */
  const leverageInt = leverage ? parseInt(leverage, 10) : 0;
  const leverageBigInt = BigInt(leverageInt);
  const epochLeverageNumber = epochLeverage ? Math.round(epochLeverage) : 0;
  const epochLeverageBigInt = BigInt(epochLeverageNumber);

  const leverageToUse = isAllocationFromCurrentAW ? leverageBigInt : epochLeverageBigInt;

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: isFetchingEpochTimestampHappenedIn || isFetchingIndividualReward,
        showCryptoSuffix: true,
        valueCrypto: individualReward ? individualReward - amount : BigInt(0),
      },
      label: t('sections.allocationPersonal'),
    },
    ...(isPersonalOnlyAllocation
      ? []
      : ([
          {
            doubleValueProps: {
              cryptoCurrency: 'ethereum' as CryptoCurrency,
              showCryptoSuffix: true,
              valueCrypto: amount,
            },
            label: t('sections.allocationProjects', { projectsNumber: allocations.length }),
          },
          isAllocationFromCurrentAW
            ? {
                childrenRight: (
                  <div className={styles.leverage}>
                    {leverage === null ? t('sections.leverageUnknown') : `${leverageInt}x`}
                  </div>
                ),
                label: t('sections.estimatedLeverage'),
                tooltipProps: {
                  position: 'bottom-right',
                  text:
                    leverage === null
                      ? t('sections.allocationTooltips.leverageUnknown')
                      : t('sections.allocationTooltips.leverage'),
                  tooltipClassName: styles.tooltip,
                },
              }
            : {
                childrenRight: (
                  <div
                    className={cx(
                      styles.leverage,
                      !isAllocationFromCurrentAW &&
                        isFetchingEpochLeverage &&
                        styles.isFetchingEpochLeverage,
                    )}
                  >
                    {
                      getValuesToDisplay({
                        cryptoCurrency: 'ethereum',
                        showCryptoSuffix: true,
                        valueCrypto: amount * leverageToUse,
                      }).primary
                    }
                  </div>
                ),
                label: t('sections.finalMatchFunding'),
                tooltipProps: {
                  position: 'bottom-right',
                  text: t('sections.allocationTooltips.finalMatchFunding'),
                  tooltipClassName: styles.tooltip,
                },
              },
        ] as SectionProps[])),
    {
      childrenRight: <TransactionDetailsDateAndTime timestamp={timestamp} />,
      label: t('sections.when'),
    },
  ];

  return (
    <Fragment>
      <BoxRounded alignment="left" hasSections isGrey isVertical>
        <Sections hasBottomDivider sections={sections} variant="small" />
      </BoxRounded>
      {!isPersonalOnlyAllocation && (
        <BoxRounded alignment="left" className={styles.projects} isGrey isVertical>
          {allocations?.map(allocation => (
            <ProjectAllocationDetailRow
              key={allocation.address}
              {...allocation}
              epoch={allocationEpoch}
              isLoading={isFetchingEpochTimestampHappenedIn}
            />
          ))}
        </BoxRounded>
      )}
    </Fragment>
  );
};

export default TransactionDetailsAllocation;
