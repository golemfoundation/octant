export interface LayoutData {
  showAllocateDrawer: boolean;
  showConnectWalletModal: boolean;
  showSettingsDrawer: boolean;
  showWalletModal: boolean;
}

export interface LayoutMethods {
  setShowAllocateDrawer: (showAllocateDrawer: boolean) => void;
  setShowConnectWalletModal: (showConnectWalletModal: boolean) => void;
  setShowSettingsDrawer: (showSettingsDrawer: boolean) => void;
  setShowWalletModal: (showWalletModal: boolean) => void;
}
