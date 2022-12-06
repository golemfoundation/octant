import { ExtendedProposal } from 'types/proposals';

import { AllocationValues } from './types';

export function getAllocationValuesInitialState(elements: ExtendedProposal[]): AllocationValues {
  return elements.reduce(
    (acc, { id }) => ({
      ...acc,
      [id.toNumber()]: 0,
    }),
    {},
  );
}

export function getAllocationsWithValues(elements: AllocationValues): string[] {
  return Object.keys(elements).filter(key => elements[key]);
}
