import { format } from 'date-fns';

export function getHistoryItemDateAndTime(timestamp: string): string {
  // Timestamp from subgraph is in seconds, needs to be changed to milliseconds.
  return format(parseInt(timestamp, 10) * 1000, 'h:mmaaa, dd MMM yyyy');
}
