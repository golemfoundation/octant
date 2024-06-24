export default interface SettingsAddressScoreProps {
  address: string;
  areBottomCornersRounded?: boolean;
  badge: 'primary' | 'secondary';
  className?: string;
  isScoreHighlighted?: boolean;
  score: number;
}
