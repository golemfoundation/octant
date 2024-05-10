import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_DONE,
  LAST_SEEN_STEP,
} from 'constants/localStorageKeys';

import useOnboardingStore from './store';

describe('useOnboardingStore', () => {
  afterEach(() => {
    const { reset } = useOnboardingStore.getState();
    localStorage.clear();
    reset();
  });

  it('should reset the state', () => {
    const {
      setIsOnboardingDone,
      setHasOnboardingBeenClosed,
      setIsOnboardingModalOpen,
      setLastSeenStep,
      reset,
    } = useOnboardingStore.getState();

    setIsOnboardingDone(true);
    setHasOnboardingBeenClosed(true);
    setLastSeenStep(3);
    setIsOnboardingModalOpen(true);

    expect(useOnboardingStore.getState().data.isOnboardingDone).toEqual(true);
    expect(useOnboardingStore.getState().data.hasOnboardingBeenClosed).toEqual(true);
    expect(useOnboardingStore.getState().data.isOnboardingModalOpen).toEqual(true);
    expect(useOnboardingStore.getState().data.lastSeenStep).toEqual(3);

    reset();

    expect(useOnboardingStore.getState().data.isOnboardingDone).toEqual(false);
    expect(useOnboardingStore.getState().data.hasOnboardingBeenClosed).toEqual(false);
    expect(useOnboardingStore.getState().data.isOnboardingModalOpen).toEqual(false);
    expect(useOnboardingStore.getState().data.lastSeenStep).toEqual(1);
  });

  it('should set isOnboardingDone to true in localStorage and state', () => {
    const { setIsOnboardingDone } = useOnboardingStore.getState();

    setIsOnboardingDone(true);
    expect(localStorage.getItem(IS_ONBOARDING_DONE)).toEqual('true');
    expect(useOnboardingStore.getState().data.isOnboardingDone).toEqual(true);
  });

  it('should set hasOnboardingBeenClosed to true in localStorage and state', () => {
    const { setHasOnboardingBeenClosed } = useOnboardingStore.getState();

    setHasOnboardingBeenClosed(true);
    expect(localStorage.getItem(HAS_ONBOARDING_BEEN_CLOSED)).toEqual('true');
    expect(useOnboardingStore.getState().data.hasOnboardingBeenClosed).toEqual(true);
  });

  it('should set lastSeenStep to 3 in localStorage and state', () => {
    const { setLastSeenStep } = useOnboardingStore.getState();

    setLastSeenStep(3);
    expect(localStorage.getItem(LAST_SEEN_STEP)).toEqual('3');
    expect(useOnboardingStore.getState().data.lastSeenStep).toEqual(3);
  });

  it('should set isOnboardingDone to false in localStorage and state', () => {
    const { setIsOnboardingDone } = useOnboardingStore.getState();

    setIsOnboardingDone(false);
    expect(localStorage.getItem(IS_ONBOARDING_DONE)).toEqual('false');
    expect(useOnboardingStore.getState().data.isOnboardingDone).toEqual(false);
  });

  it('should set hasOnboardingBeenClosed to false in localStorage and state', () => {
    const { setHasOnboardingBeenClosed } = useOnboardingStore.getState();

    setHasOnboardingBeenClosed(false);
    expect(localStorage.getItem(HAS_ONBOARDING_BEEN_CLOSED)).toEqual('false');
    expect(useOnboardingStore.getState().data.hasOnboardingBeenClosed).toEqual(false);
  });

  it('should set lastSeenStep to 2 in localStorage and state', () => {
    const { setLastSeenStep } = useOnboardingStore.getState();

    setLastSeenStep(2);
    expect(localStorage.getItem(LAST_SEEN_STEP)).toEqual('2');
    expect(useOnboardingStore.getState().data.lastSeenStep).toEqual(2);
  });

  it('should get isOnboardingDone from localStorage and set in state', () => {
    const { setValuesFromLocalStorage } = useOnboardingStore.getState();

    localStorage.setItem(IS_ONBOARDING_DONE, 'true');
    expect(useOnboardingStore.getState().meta.isInitialized).toEqual(false);
    setValuesFromLocalStorage();
    expect(useOnboardingStore.getState().meta.isInitialized).toEqual(true);
    expect(useOnboardingStore.getState().data.isOnboardingDone).toEqual(true);
  });

  it('should get hasOnboardingBeenClosed from localStorage and set in state', () => {
    const { setValuesFromLocalStorage } = useOnboardingStore.getState();

    localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
    expect(useOnboardingStore.getState().meta.isInitialized).toEqual(false);
    setValuesFromLocalStorage();
    expect(useOnboardingStore.getState().meta.isInitialized).toEqual(true);
    expect(useOnboardingStore.getState().data.hasOnboardingBeenClosed).toEqual(true);
  });

  it('should get lastSeenStep from localStorage and set in state', () => {
    const { setValuesFromLocalStorage } = useOnboardingStore.getState();

    localStorage.setItem(LAST_SEEN_STEP, '3');
    expect(useOnboardingStore.getState().meta.isInitialized).toEqual(false);
    setValuesFromLocalStorage();
    expect(useOnboardingStore.getState().meta.isInitialized).toEqual(true);
    expect(useOnboardingStore.getState().data.lastSeenStep).toEqual(3);
  });

  it('should return default state when there is no value in localStorage', () => {
    const { setValuesFromLocalStorage } = useOnboardingStore.getState();

    setValuesFromLocalStorage();
    expect(useOnboardingStore.getState().data.isOnboardingDone).toEqual(false);
    expect(useOnboardingStore.getState().data.hasOnboardingBeenClosed).toEqual(false);
    expect(useOnboardingStore.getState().data.isOnboardingModalOpen).toEqual(false);
    expect(useOnboardingStore.getState().data.lastSeenStep).toEqual(1);
  });
});
