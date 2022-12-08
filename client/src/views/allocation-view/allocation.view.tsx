import React, { ReactElement, useEffect, useState } from 'react';
import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';

import { ALLOCATIONS_MAX_NUMBER } from 'constants/allocations';
import { triggerToast } from 'utils/triggerToast';
import { useIdsInAllocation } from 'hooks/useIdsInAllocation';
import { useProposals } from 'hooks/useProposals';
import AllocationItem from 'components/dedicated/allocation-item/allocation-item.component';
import Button from 'components/core/button/button.component';
import MainLayout from 'layouts/main-layout/main.layout';

import { AllocationValues } from './types';
import { getAllocationValuesInitialState, getAllocationsWithValues } from './utils';
import styles from './style.module.scss';

const AllocationView = (): ReactElement => {
  const [proposals] = useProposals();
  const [idsInAllocation] = useIdsInAllocation(proposals);
  const [selectedItemId, setSelectedItemId] = useState<null | number>(null);
  const [allocationValues, setAllocationValues] = useState<AllocationValues>({});

  useEffect(() => {
    const allocationValuesInitValue = getAllocationValuesInitialState(proposals);
    setAllocationValues(allocationValuesInitValue);
  }, [proposals]);

  const changeAllocationItemValue = (id: number, value: number) => {
    const allocationsWithValues = getAllocationsWithValues(allocationValues);
    if (
      allocationsWithValues.length >= ALLOCATIONS_MAX_NUMBER &&
      !allocationsWithValues.includes(id.toString())
    ) {
      triggerToast({
        message: 'Currently you can allocate to one project only.',
        title: 'Only one item allowed',
      });
      return;
    }
    setAllocationValues(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };

  const onResetAllocationValues = () => {
    const allocationValuesInitValue = getAllocationValuesInitialState(proposals);
    setAllocationValues(allocationValuesInitValue);
  };

  const isRenderingReady = proposals.length > 0 && !isEmpty(allocationValues);

  return (
    <MainLayout
      isLoading={!isRenderingReady}
      navigationBottomSuffix={
        <div className={styles.buttons}>
          <Button className={styles.button} label="Reset" onClick={onResetAllocationValues} />
          <Button className={styles.button} label="Allocate" variant="cta" />
        </div>
      }
    >
      <div className={styles.boxes}>
        {idsInAllocation.map((idInAllocation, index) => {
          const allocationItem = proposals.find(({ id }) => id.toNumber() === idInAllocation)!;
          const isSelected = selectedItemId === allocationItem.id.toNumber();
          const value = allocationValues[allocationItem.id.toNumber()];
          return (
            <AllocationItem
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={cx(styles.box, isSelected && styles.isSelected)}
              isSelected={isSelected}
              onChange={changeAllocationItemValue}
              onSelectItem={setSelectedItemId}
              value={value}
              {...allocationItem}
            />
          );
        })}
      </div>
      {selectedItemId !== null && (
        <div className={styles.selectedItemOverlay} onClick={() => setSelectedItemId(null)} />
      )}
    </MainLayout>
  );
};

export default AllocationView;
