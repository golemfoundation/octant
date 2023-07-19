/**
 * Identifies if currentEpoch is defined and set as 0,
 * marking "prelaunch" phase of the app.
 * @param currentEpoch -- current epoch number or undefined, if not yet fetched.
 */
export default function getIsPreLaunch(currentEpoch: undefined | number): boolean {
  return currentEpoch !== undefined && currentEpoch === 0;
}
