export interface LayoutData {
  isAllocationDrawerOpen: boolean;
  isConnectWalletModalOpen: boolean;
  isSettingsDrawerOpen: boolean;
  isWalletModalOpen: boolean;
}

export interface LayoutMethods {
  setIsAllocationDrawerOpen: (isAllocationDrawerOpen: boolean) => void;
  setIsConnectWalletModalOpen: (isConnectWalletModalOpen: boolean) => void;
  setIsSettingsDrawerOpen: (isSettingsDrawerOpen: boolean) => void;
  setIsWalletModalOpen: (isWalletModalOpen: boolean) => void;
}
