/* eslint no-console: 0 */
import { Contract } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

type PropertyPredicateT = (value: any) => boolean;
type VerifiablePropertyT = [string | [string, [any]], PropertyPredicateT | any];

interface Verifiable {
  address: string;
  contractName: string;
  properties: Array<VerifiablePropertyT>;
}

async function getContract<ContractT extends Contract>(
  verifiable: Verifiable,
  hre: HardhatRuntimeEnvironment,
): Promise<ContractT> {
  return hre.ethers.getContractAt(verifiable.contractName, verifiable.address);
}

function propertyOf<ContractT>(property: keyof ContractT) {
  return property;
}

function defaultPredicate(expected: any) {
  return (actual: any) => {
    return actual === expected;
  };
}

export function arraysEqualPredicate(expected: [any], shouldCheckOrder = false) {
  return (a: [any]): boolean => {
    const actual = [...a]; // make a copy

    if (expected.length !== actual.length) return false;

    if (!shouldCheckOrder) {
      expected.sort();
      actual.sort();
    }

    return expected.every((elem, index) => {
      console.debug('Expected: %s, actual: %s', elem, actual[index]);
      return elem === actual[index];
    });
  };
}

function predicateToStr(p: PropertyPredicateT | any): string {
  if (p instanceof Function) {
    return '<custom predicate>';
  }

  return p.toString();
}

/* eslint-disable no-console */
export async function verify<ContractT extends Contract>(
  verifiable: Verifiable,
  hre: HardhatRuntimeEnvironment,
): Promise<number> {
  const contract: ContractT = await getContract(verifiable, hre);

  let errors = 0;

  for await (const [property, predicateOrVal] of verifiable.properties) {
    let propertyFunc;
    let propertyName: string;
    if (typeof property === 'string') {
      propertyName = property as string;
      propertyFunc = async () => contract[propertyOf<ContractT>(propertyName)]();
    } else {
      let args: [any];
      [propertyName, args] = property as [string, [any]];
      propertyFunc = async () => contract[propertyOf<ContractT>(propertyName)](...args);
    }

    const propertyValue = await propertyFunc();
    const predicate =
      predicateOrVal instanceof Function ? predicateOrVal : defaultPredicate(predicateOrVal);

    console.debug(
      'Checking %s. Expected: %s. Value: %s',
      propertyName,
      predicateToStr(predicateOrVal),
      propertyValue,
    );

    if (!predicate(propertyValue)) {
      console.error('Verification failed for %s.', propertyName);
      errors += 1;
    }
  }

  return errors;
}
