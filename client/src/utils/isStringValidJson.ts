export default function isStringValidJson(value: string | null): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    JSON.parse(value);
  } catch (e) {
    return false;
  }

  return true;
}
