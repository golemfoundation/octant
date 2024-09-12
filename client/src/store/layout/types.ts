export interface LayoutData {
  showAllocationDrawer: boolean;
  showConnectWalletModal: boolean;
  showSettingsDrawer: boolean;
  showWalletModal: boolean;
}

export interface LayoutMethods {
  setShowAllocationDrawer: (showAllocationDrawer: boolean) => void;
  setShowConnectWalletModal: (showConnectWalletModal: boolean) => void;
  setShowSettingsDrawer: (showSettingsDrawer: boolean) => void;
  setShowWalletModal: (showWalletModal: boolean) => void;
}
