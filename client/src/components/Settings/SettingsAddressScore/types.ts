export default interface SettingsAddressScoreProps {
  address: string;
  areBottomCornersRounded?: boolean;
  badge: 'primary' | 'secondary';
  className?: string;
  isMessageSigned?: boolean;
  isScoreHighlighted?: boolean;
  isSignMessageButtonDisabled?: boolean;
  mode: 'score' | 'sign';
  onSignMessage?: () => void;
  score: number;
}
