export default interface SettingsAddressScoreProps {
  address: string;
  areBottomCornersRounded?: boolean;
  badge: 'primary' | 'secondary';
  className?: string;
  isScoreHighlighted?: boolean;
  isSelected?: boolean;
  mode: 'score' | 'select';
  score: number;
}
