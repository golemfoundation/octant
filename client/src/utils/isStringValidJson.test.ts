import isStringValidJson from './isStringValidJson';

describe('isStringValidJson', () => {
  it('should return true for valid JSON', () => {
    expect(isStringValidJson('{"name": "John", "age": 30}')).toBe(true);
    expect(isStringValidJson('[1, 2, 3]')).toBe(true);
    expect(isStringValidJson('"hello world"')).toBe(true);
  });

  it('should return false for invalid JSON', () => {
    expect(isStringValidJson('{name: "John", age: 30}')).toBe(false);
    expect(isStringValidJson('{"name": "John", "age": 30')).toBe(false);
    expect(isStringValidJson('{"name": "John", age": "thirty"}')).toBe(false);
  });

  it('should return false for non-string input', () => {
    expect(isStringValidJson(null)).toBe(false);
    // @ts-expect-error Parameter of the wrong type passed on purpose for testing.
    expect(isStringValidJson(undefined)).toBe(false);
    // @ts-expect-error Parameter of the wrong type passed on purpose for testing.
    expect(isStringValidJson(123)).toBe(false);
    // @ts-expect-error Parameter of the wrong type passed on purpose for testing.
    expect(isStringValidJson(true)).toBe(false);
    // @ts-expect-error Parameter of the wrong type passed on purpose for testing.
    expect(isStringValidJson({ age: 30, name: 'John' })).toBe(false);
  });
});
