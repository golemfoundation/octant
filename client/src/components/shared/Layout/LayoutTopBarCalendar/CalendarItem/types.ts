export default interface CalendarItemProps {
  durationToChangeAWInMinutes: number;
  from: Date;
  href?: string;
  id: string;
  isActive: boolean;
  isAlert?: boolean;
  label: string;
  shouldUseThirdPersonSingularVerb?: boolean;
  to?: Date;
}
