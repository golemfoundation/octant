import { VerificationResult } from "../runner";

type Predicate<T> = (elem: T) => boolean | VerificationResult

function abs(v: bigint): bigint {
  if (v < BigInt(0)) {
    return -v
  }
  return v
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

