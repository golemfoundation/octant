import { VerificationResult } from "../runner";

type Predicate<T> = (elem: T) => boolean | VerificationResult

export const SCALE_FACTOR = 10n ** 18n;

function abs(v: bigint): bigint {
  if (v < BigInt(0)) {
    return -v
  }
  return v
}

export function sqrt(v: bigint): bigint {
  // Heron's Algorithm
  // SQRT by default has some error margin, i.e. for 1000 it returns 31 instead of 31.622776601683793319988935444327
  // This is due to the fact that we are using BigInts and not floating point numbers
  // That's why we use SCALE_FACTOR coefficient to secure ourselves from such margin errors.
  let x = v * SCALE_FACTOR;
  let y = (x + 1n) / 2n;

  while (y < x) {
    x = y;
    y = (x + v * SCALE_FACTOR / x) / 2n;
  }

  let result = x / (SCALE_FACTOR ** (1n / 2n));
  return result;
}

export function multiplyFloatByBigInt(v1: number, v2: bigint): bigint {
  let productBigInt = BigInt(v1 * 1e6) * v2;
  return productBigInt / BigInt(1e6);
}

export function assertEq(value: bigint, expected: bigint, maxMargin?: bigint, shouldPrintWhenValuesWithinExpectedError = false): VerificationResult {
  let msg = ""
  const margin = maxMargin ?? BigInt(0)

  const diff = abs(expected - value)
  const isWithinMargin = diff <= margin

  const comparisonMsg = `Expected: ${expected}, got: ${value}, error: ${diff}`
  if (!isWithinMargin) {
    msg = `Comparison outside expected error margin. ${comparisonMsg}`
  }
  else if (shouldPrintWhenValuesWithinExpectedError) {
    msg = comparisonMsg
  }

  return { message: msg, result: isWithinMargin }

}

export function assertAll<T>(elems: T[], predicate: Predicate<T>): VerificationResult {
  let isValid = true
  let msg = ""
  for (const elem of elems) {
    const predicateResult = predicate(elem)

    if (typeof predicateResult === "boolean") {
      if (!predicateResult) {
        isValid = false
        msg += `\n\tFailed at ${elem}`
      }
    }
    else {
      const { message: m, result: isSubpredicateValid } = predicateResult as VerificationResult
      msg += `\n\t${elem}: ${m}`
      if (!isSubpredicateValid) {
        isValid = false
      }
    }
  }

  return { message: msg, result: isValid }
}

