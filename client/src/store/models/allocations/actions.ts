import actionCreator from 'store/utils/actionCreator';

import { AllocationAddPayload, AllocationRemovePayload, AllocationsAddPayload } from './types';

const allocationsPrefix = 'ALLOCATIONS';

export const allocationsSet = actionCreator<AllocationsAddPayload>(allocationsPrefix, 'SET');
export const allocationAdd = actionCreator<AllocationAddPayload>(allocationsPrefix, 'ADD_ONE');
export const allocationRemove = actionCreator<AllocationRemovePayload>(
  allocationsPrefix,
  'REMOVE_ONE',
);
