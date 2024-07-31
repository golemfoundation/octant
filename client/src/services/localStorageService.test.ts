import {
  ALLOCATION_ITEMS_KEY,
  ALLOCATION_REWARDS_FOR_PROJECTS,
  DISPLAY_CURRENCY,
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
  LAST_SEEN_STEP,
  PROJECTS_ADDRESSES_RANDOMIZED_ORDER,
  WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP,
  WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP,
  WAS_LOCK_GLM_ALREADY_CLOSED_TIP,
  WAS_REWARDS_ALREADY_CLOSED_TIP,
  WAS_WITHDRAW_ALREADY_CLOSED_TIP,
} from 'constants/localStorageKeys';
import { ProjectsAddressesRandomizedOrder } from 'types/localStorage';

import localStorageService, { LocalStorageInitParams } from './localStorageService';

const localStorageInitParams: LocalStorageInitParams = {
  currentEpoch: 1,
  isDecisionWindowOpen: true,
  projectsEpoch: {
    projectsAddresses: ['0x123', '0x234', '0x345'],
    projectsCid: '123',
  },
};

const validateProjectsAddressesRandomizedOrderSet = (
  projectsAddressesRandomizedOrder: ProjectsAddressesRandomizedOrder,
  projectsAddresses: string[],
): void => {
  expect(projectsAddressesRandomizedOrder.addressesRandomizedOrder).toEqual(
    expect.arrayContaining(projectsAddresses),
  );
  expect(projectsAddressesRandomizedOrder.addressesRandomizedOrder.length).toEqual(
    projectsAddresses.length,
  );
};

describe('LocalStorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('init', () => {
    it('should validate localStorage JSONs', () => {
      localStorage.setItem('someKey', 'invalid-json');
      localStorage.setItem('anotherKey', '{"valid": "json"}');
      localStorageService.init(localStorageInitParams);
      expect(localStorage.getItem('someKey')).toBe(null);
      expect(localStorage.getItem('anotherKey')).toBe('{"valid": "json"}');
    });

    it(`should validate ${ALLOCATION_ITEMS_KEY}`, () => {
      localStorage.setItem(ALLOCATION_ITEMS_KEY, '[1, "2", true]');
      localStorageService.init(localStorageInitParams);
      expect(localStorage.getItem(ALLOCATION_ITEMS_KEY)).toBe(null);
    });

    it(`should validate ${IS_ONBOARDING_ALWAYS_VISIBLE}`, () => {
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'not-a-boolean');
      localStorageService.init(localStorageInitParams);
      expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).toBe('false');
    });

    it(`should validate ${IS_ONBOARDING_DONE}`, () => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'not-a-boolean');
      localStorageService.init(localStorageInitParams);
      expect(localStorage.getItem(IS_ONBOARDING_DONE)).toBe('false');
    });

    it(`should validate ${HAS_ONBOARDING_BEEN_CLOSED}`, () => {
      localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'not-a-boolean');
      localStorageService.init(localStorageInitParams);
      expect(localStorage.getItem(HAS_ONBOARDING_BEEN_CLOSED)).toBe('false');
    });

    it(`should validate ${LAST_SEEN_STEP}`, () => {
      localStorage.setItem(LAST_SEEN_STEP, 'not-a-number');
      localStorageService.init(localStorageInitParams);
      expect(localStorage.getItem(LAST_SEEN_STEP)).toBe('0');
    });

    it(`should validate ${DISPLAY_CURRENCY}`, () => {
      localStorage.setItem(DISPLAY_CURRENCY, 'invalid-currency');
      localStorageService.init(localStorageInitParams);
      expect(localStorage.getItem(DISPLAY_CURRENCY)).toBe('"usd"');
    });

    it(`should validate ${IS_CRYPTO_MAIN_VALUE_DISPLAY}`, () => {
      localStorage.setItem(IS_CRYPTO_MAIN_VALUE_DISPLAY, 'not-a-boolean');
      localStorageService.init(localStorageInitParams);
      expect(localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY)).toBe('true');
    });

    it(`should validate ${WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP}`, () => {
      localStorage.setItem(WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP, 'not-a-boolean');
      localStorageService.init(localStorageInitParams);
      expect(localStorage.getItem(WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP)).toBe('false');
    });

    it(`should validate ${WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP}`, () => {
      localStorage.setItem(WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP, 'not-a-boolean');
      localStorageService.init(localStorageInitParams);
      expect(localStorage.getItem(WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP)).toBe('false');
    });

    it(`should validate ${WAS_LOCK_GLM_ALREADY_CLOSED_TIP}`, () => {
      localStorage.setItem(WAS_LOCK_GLM_ALREADY_CLOSED_TIP, 'not-a-boolean');
      localStorageService.init(localStorageInitParams);
      expect(localStorage.getItem(WAS_LOCK_GLM_ALREADY_CLOSED_TIP)).toBe('false');
    });

    it(`should validate ${WAS_REWARDS_ALREADY_CLOSED_TIP}`, () => {
      localStorage.setItem(WAS_REWARDS_ALREADY_CLOSED_TIP, 'not-a-boolean');
      localStorageService.init(localStorageInitParams);
      expect(localStorage.getItem(WAS_REWARDS_ALREADY_CLOSED_TIP)).toBe('false');
    });

    it(`should validate ${WAS_WITHDRAW_ALREADY_CLOSED_TIP}`, () => {
      localStorage.setItem(WAS_WITHDRAW_ALREADY_CLOSED_TIP, 'not-a-boolean');
      localStorageService.init(localStorageInitParams);
      expect(localStorage.getItem(WAS_WITHDRAW_ALREADY_CLOSED_TIP)).toBe('false');
    });

    it(`should validate ${ALLOCATION_REWARDS_FOR_PROJECTS}`, () => {
      localStorage.setItem(ALLOCATION_REWARDS_FOR_PROJECTS, 'not-a-bignumber');
      localStorageService.init(localStorageInitParams);
      expect(localStorage.getItem(ALLOCATION_REWARDS_FOR_PROJECTS)).toBe(
        JSON.stringify(BigInt(0).toString()),
      );

      const bigInt100Stringified = JSON.stringify(BigInt(100).toString());
      localStorage.setItem(ALLOCATION_REWARDS_FOR_PROJECTS, bigInt100Stringified);
      localStorageService.init(localStorageInitParams);
      expect(localStorage.getItem(ALLOCATION_REWARDS_FOR_PROJECTS)).toBe(bigInt100Stringified);
    });

    describe(`should validate ${PROJECTS_ADDRESSES_RANDOMIZED_ORDER}`, () => {
      it('sets the value when data in localStorage is not valid, string', () => {
        localStorage.setItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER, 'not-a-correct-type');
        localStorageService.init(localStorageInitParams);

        const projectsAddressesRandomizedOrder = JSON.parse(
          localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER) || 'null',
        );

        expect(projectsAddressesRandomizedOrder.addressesRandomizedOrder).toEqual(
          expect.arrayContaining(localStorageInitParams.projectsEpoch.projectsAddresses),
        );
        expect(projectsAddressesRandomizedOrder.addressesRandomizedOrder.length).toEqual(
          localStorageInitParams.projectsEpoch.projectsAddresses.length,
        );
      });

      it('sets the value when data in localStorage is not valid, epoch is string', () => {
        localStorage.setItem(
          PROJECTS_ADDRESSES_RANDOMIZED_ORDER,
          JSON.stringify({ addressesRandomizedOrder: [], epoch: 'string' }),
        );
        localStorageService.init(localStorageInitParams);

        const projectsAddressesRandomizedOrder = JSON.parse(
          localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER) || 'null',
        );

        validateProjectsAddressesRandomizedOrderSet(
          projectsAddressesRandomizedOrder,
          localStorageInitParams.projectsEpoch.projectsAddresses,
        );
      });

      it('sets the value when data in localStorage is not valid, epoch is boolean', () => {
        localStorage.setItem(
          PROJECTS_ADDRESSES_RANDOMIZED_ORDER,
          JSON.stringify({ addressesRandomizedOrder: [], epoch: true }),
        );
        localStorageService.init(localStorageInitParams);

        const projectsAddressesRandomizedOrder = JSON.parse(
          localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER) || 'null',
        );

        validateProjectsAddressesRandomizedOrderSet(
          projectsAddressesRandomizedOrder,
          localStorageInitParams.projectsEpoch.projectsAddresses,
        );
      });

      it('sets the value when data in localStorage is not valid, epoch is object', () => {
        localStorage.setItem(
          PROJECTS_ADDRESSES_RANDOMIZED_ORDER,
          JSON.stringify({ addressesRandomizedOrder: [], epoch: {} }),
        );
        localStorageService.init(localStorageInitParams);

        const projectsAddressesRandomizedOrder = JSON.parse(
          localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER) || 'null',
        );

        validateProjectsAddressesRandomizedOrderSet(
          projectsAddressesRandomizedOrder,
          localStorageInitParams.projectsEpoch.projectsAddresses,
        );
      });

      it('sets the value when data in localStorage is not valid, addressesRandomizedOrder is string', () => {
        localStorage.setItem(
          PROJECTS_ADDRESSES_RANDOMIZED_ORDER,
          JSON.stringify({ addressesRandomizedOrder: 'string', epoch: 1 }),
        );
        localStorageService.init(localStorageInitParams);

        const projectsAddressesRandomizedOrder = JSON.parse(
          localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER) || 'null',
        );

        validateProjectsAddressesRandomizedOrderSet(
          projectsAddressesRandomizedOrder,
          localStorageInitParams.projectsEpoch.projectsAddresses,
        );
      });

      it('sets the value when data in localStorage is not valid, addressesRandomizedOrder is boolean', () => {
        localStorage.setItem(
          PROJECTS_ADDRESSES_RANDOMIZED_ORDER,
          JSON.stringify({ addressesRandomizedOrder: true, epoch: 1 }),
        );
        localStorageService.init(localStorageInitParams);

        const projectsAddressesRandomizedOrder = JSON.parse(
          localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER) || 'null',
        );

        validateProjectsAddressesRandomizedOrderSet(
          projectsAddressesRandomizedOrder,
          localStorageInitParams.projectsEpoch.projectsAddresses,
        );
      });

      it('sets the value when data in localStorage is not valid, addressesRandomizedOrder is object', () => {
        localStorage.setItem(
          PROJECTS_ADDRESSES_RANDOMIZED_ORDER,
          JSON.stringify({ addressesRandomizedOrder: {}, epoch: 1 }),
        );
        localStorageService.init(localStorageInitParams);

        const projectsAddressesRandomizedOrder = JSON.parse(
          localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER) || 'null',
        );

        validateProjectsAddressesRandomizedOrderSet(
          projectsAddressesRandomizedOrder,
          localStorageInitParams.projectsEpoch.projectsAddresses,
        );
      });

      it('sets the value when epoch number does not match but AW is open', () => {
        localStorage.setItem(
          PROJECTS_ADDRESSES_RANDOMIZED_ORDER,
          JSON.stringify({
            addressesRandomizedOrder: localStorageInitParams.projectsEpoch,
            epoch: 1,
          }),
        );
        localStorageService.init({ ...localStorageInitParams, currentEpoch: 9 });

        const projectsAddressesRandomizedOrder = JSON.parse(
          localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER) || 'null',
        );

        validateProjectsAddressesRandomizedOrderSet(
          projectsAddressesRandomizedOrder,
          localStorageInitParams.projectsEpoch.projectsAddresses,
        );
      });

      it('removes the data from localStorage when epoch number does not match and AW is closed', () => {
        localStorage.setItem(
          PROJECTS_ADDRESSES_RANDOMIZED_ORDER,
          JSON.stringify({
            addressesRandomizedOrder: localStorageInitParams.projectsEpoch,
            epoch: 1,
          }),
        );
        localStorageService.init({
          ...localStorageInitParams,
          currentEpoch: 9,
          isDecisionWindowOpen: false,
        });

        expect(localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER)).toBe(null);
      });

      it('sets the value when number of projects does not match but AW is open', () => {
        const projectsAddressesDifferent = ['1', '2', '3', '4', '5'];

        localStorage.setItem(
          PROJECTS_ADDRESSES_RANDOMIZED_ORDER,
          JSON.stringify({
            addressesRandomizedOrder: localStorageInitParams.projectsEpoch,
            epoch: 2,
          }),
        );
        localStorageService.init({
          ...localStorageInitParams,
          projectsEpoch: { projectsAddresses: projectsAddressesDifferent, projectsCid: '' },
        });

        const projectsAddressesRandomizedOrder = JSON.parse(
          localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER) || 'null',
        );

        validateProjectsAddressesRandomizedOrderSet(
          projectsAddressesRandomizedOrder,
          projectsAddressesDifferent,
        );
      });

      it('removes the data from localStorage when number of projects does not match and AW is closed', () => {
        // Different length of projects.
        localStorage.setItem(
          PROJECTS_ADDRESSES_RANDOMIZED_ORDER,
          JSON.stringify({
            addressesRandomizedOrder: localStorageInitParams.projectsEpoch,
            epoch: 2,
          }),
        );
        localStorageService.init({
          ...localStorageInitParams,
          isDecisionWindowOpen: false,
          projectsEpoch: { projectsAddresses: ['1', '2', '3', '4', '5'], projectsCid: '' },
        });
        expect(localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER)).toBe(null);
      });

      it('removes the data from localStorage when AW is closed', () => {
        localStorage.setItem(
          PROJECTS_ADDRESSES_RANDOMIZED_ORDER,
          JSON.stringify({
            addressesRandomizedOrder: localStorageInitParams.projectsEpoch,
            epoch: 1,
          }),
        );
        localStorageService.init({ ...localStorageInitParams, isDecisionWindowOpen: false });
        expect(localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER)).toBe(null);
      });
    });
  });
});
