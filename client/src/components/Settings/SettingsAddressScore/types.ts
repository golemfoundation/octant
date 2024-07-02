export default interface SettingsAddressScoreProps {
  address: string;
  areBottomCornersRounded?: boolean;
  badge: 'primary' | 'secondary';
  className?: string;
  isMessageSigned?: boolean;
  isSignMessageButtonDisabled?: boolean;
  mode: 'score' | 'sign';
  onSignMessage?: () => void;
  score: number;
  scoreHighlight?: 'black' | 'red';
  showActiveDot?: boolean;
}
