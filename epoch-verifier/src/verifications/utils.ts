import { VerificationResult } from "../runner";

type Predicate<T> = (elem: T) => boolean | VerificationResult

function abs(v: bigint): bigint {
  if (v < BigInt(0)){
    return -v
  }
  else {
    return v
  }
}

export function assertEq(value: bigint, expected: bigint, maxMargin?: bigint, printWhenValuesWithinExpectedError: boolean = false): VerificationResult {
  let msg = ""
  const margin = maxMargin ?? BigInt(0)

  const diff = abs(expected - value)
  const isWithinMargin = diff <= margin

  const comparisonMsg = `Expected: ${expected}, got: ${value}, error: ${diff}`
  if (!isWithinMargin){
    msg = "Comparison outside expected error margin. " + comparisonMsg 
  }
  else if (printWhenValuesWithinExpectedError){
    msg = comparisonMsg
  }

  return {result: isWithinMargin, message: msg}
  
}

export function assertAll<T>(elems: T[], predicate: Predicate<T>): VerificationResult {
  let result = true
  let msg = ""
  for (const elem of elems){
    const predicateResult = predicate(elem)

    if ( typeof predicateResult === "boolean" ){
      if(!predicateResult){
        result = false
        msg += `\n\tFailed at ${elem}`
      }
    }
    else {
      const {result: r, message: m} = predicateResult as VerificationResult
      msg += `\n\t${elem}: ${m}`      
      if (!r){
        result = false
      }
    }
  }

  return {result, message: msg}
}

