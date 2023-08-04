/**
 * Simple atob(string) doesn't decode some of the characters.
 * Reasoning: https://stackoverflow.com/a/30106551/7059945
 */
export default function decodeBase64ToUtf8(string: string): string {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(string), character => `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(''),
  );
}
