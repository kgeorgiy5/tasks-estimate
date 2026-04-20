/**
 * Returns number of minutes from local day start.
 */
export function toMinutesSinceDayStart(date: Date): number {
  return (
    date.getHours() * 60 +
    date.getMinutes() +
    date.getSeconds() / 60 +
    date.getMilliseconds() / 60000
  );
}
