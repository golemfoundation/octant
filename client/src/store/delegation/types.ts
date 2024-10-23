export interface DelegationData {
  calculatingUQScoreMode: 'score' | 'sign';
  delegationPrimaryAddress?: string;
  delegationSecondaryAddress?: string;
  isDelegationCalculatingUQScoreModalOpen: boolean;
  isDelegationCompleted: boolean;
  isDelegationConnectModalOpen: boolean;
  isDelegationInProgress: boolean;
  isTimeoutListPresenceModalOpen:
    | {
        address: string;
        value: boolean;
      }
    | undefined;
  primaryAddressScore?: number;
  secondaryAddressScore?: number;
}

export interface DelegationMethods {
  reset: () => void;
  setCalculatingUQScoreMode: (payload: DelegationData['calculatingUQScoreMode']) => void;
  setDelegationPrimaryAddress: (payload: DelegationData['delegationPrimaryAddress']) => void;
  setDelegationSecondaryAddress: (payload: DelegationData['delegationSecondaryAddress']) => void;
  setIsDelegationCalculatingUQScoreModalOpen: (
    payload: DelegationData['isDelegationCalculatingUQScoreModalOpen'],
  ) => void;
  setIsDelegationCompleted: (payload: DelegationData['isDelegationCompleted']) => void;
  setIsDelegationConnectModalOpen: (
    payload: DelegationData['isDelegationConnectModalOpen'],
  ) => void;
  setIsDelegationInProgress: (payload: DelegationData['isDelegationInProgress']) => void;
  setIsTimeoutListPresenceModalOpen: (
    payload: Exclude<DelegationData['isTimeoutListPresenceModalOpen'], undefined>,
  ) => void;
  setPrimaryAddressScore: (payload: DelegationData['primaryAddressScore']) => void;
  setSecondaryAddressScore: (payload: DelegationData['secondaryAddressScore']) => void;
  setValuesFromLocalStorage: () => void;
}
