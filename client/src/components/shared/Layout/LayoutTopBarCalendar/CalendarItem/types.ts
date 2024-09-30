export default interface CalendarItemProps {
  from: Date;
  href?: string;
  id: string;
  isActive: boolean;
  label: string;
  to?: Date;
}
