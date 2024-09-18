export type CurrentView = 'edit' | 'summary';

export interface AllocationsData {
  allocations: string[];
  currentView: CurrentView;
  rewardsForProjects: bigint;
}

export interface AllocationsMethods {
  addAllocations: (projectAddresses: string[]) => void;
  removeAllocations: (projectAddresses: string[]) => void;
  setAllocations: (projectAddresses: string[]) => void;
  setCurrentView: (currentView: CurrentView) => void;
  setRewardsForProjects: (rewardsForProjects: bigint) => void;
}
