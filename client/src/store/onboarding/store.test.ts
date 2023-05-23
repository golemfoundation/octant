import { IS_ONBOARDING_DONE } from 'constants/localStorageKeys';

import useOnboardingStore from './store';

describe('useOnboardingStore', () => {
  afterEach(() => {
    const { reset } = useOnboardingStore.getState();
    localStorage.clear();
    reset();
  });

  it('should reset the state', () => {
    const { setIsOnboardingDone, reset } = useOnboardingStore.getState();

    setIsOnboardingDone(true);
    expect(useOnboardingStore.getState().data.isOnboardingDone).toEqual(true);
    reset();
    expect(useOnboardingStore.getState().data.isOnboardingDone).toEqual(false);
  });

  it('should set isOnboardingDone to true in localStorage and state', () => {
    const { setIsOnboardingDone } = useOnboardingStore.getState();

    setIsOnboardingDone(true);
    expect(localStorage.getItem(IS_ONBOARDING_DONE)).toEqual('true');
    expect(useOnboardingStore.getState().data.isOnboardingDone).toEqual(true);
  });

  it('should set isOnboardingDone to false in localStorage and state', () => {
    const { setIsOnboardingDone } = useOnboardingStore.getState();

    setIsOnboardingDone(false);
    expect(localStorage.getItem(IS_ONBOARDING_DONE)).toEqual('false');
    expect(useOnboardingStore.getState().data.isOnboardingDone).toEqual(false);
  });

  it('should get isOnboardingDone from localStorage and set in state', () => {
    const { setValuesFromLocalStorage } = useOnboardingStore.getState();

    localStorage.setItem(IS_ONBOARDING_DONE, 'true');
    expect(useOnboardingStore.getState().meta.isInitialized).toEqual(false);
    setValuesFromLocalStorage();
    expect(useOnboardingStore.getState().meta.isInitialized).toEqual(true);
    expect(useOnboardingStore.getState().data.isOnboardingDone).toEqual(true);
  });

  it('should return default state when there is no value in localStorage', () => {
    const { setValuesFromLocalStorage } = useOnboardingStore.getState();

    setValuesFromLocalStorage();
    expect(useOnboardingStore.getState().data.isOnboardingDone).toEqual(false);
  });
});
