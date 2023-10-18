import format from 'date-fns/format';

export function getHistoryItemDateAndTime(timestamp: string): string {
  return format(parseInt(timestamp, 10) / 1000, 'h:mmaaa, dd MMM yyyy');
}
