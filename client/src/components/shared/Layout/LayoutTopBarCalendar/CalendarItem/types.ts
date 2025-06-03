import { Milestone } from 'constants/milestones';

export default interface CalendarItemProps extends Milestone {
  durationToChangeAWInMinutes: number;
  isActive: boolean;
  isAlert?: boolean;
}
