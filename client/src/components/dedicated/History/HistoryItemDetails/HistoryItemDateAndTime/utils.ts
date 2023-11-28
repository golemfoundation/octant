import format from 'date-fns/format';

export function getHistoryItemDateAndTime(timestamp: string): string {
  // Timestamp from subgraph is in microseconds, needs to be changed to milliseconds.
  return format(Math.floor(parseInt(timestamp, 10) / 1000), 'h:mmaaa, dd MMM yyyy');
}
