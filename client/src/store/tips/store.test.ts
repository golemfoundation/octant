import {
  WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP,
  WAS_ALLOCATE_REWARDS_ALREADY_CLOSED_TIP,
  WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP,
  WAS_LOCK_GLM_ALREADY_CLOSED_TIP,
  WAS_REWARDS_ALREADY_CLOSED_TIP,
  WAS_WITHDRAW_ALREADY_CLOSED_TIP,
} from 'constants/localStorageKeys';

import useTipsStore from './store';

describe('useTipsStore', () => {
  afterEach(() => {
    const { reset } = useTipsStore.getState();
    localStorage.clear();
    reset();
  });

  it('should reset the state', () => {
    const {
      setWasAddFavouritesAlreadyClosed,
      setWasConnectWalletAlreadyClosed,
      setWasLockGLMAlreadyClosed,
      setWasRewardsAlreadyClosed,
      setWasWithdrawAlreadyClosed,
      setWasAllocateRewardsAlreadyClosed,
      reset,
    } = useTipsStore.getState();

    setWasAddFavouritesAlreadyClosed(true);
    setWasConnectWalletAlreadyClosed(true);
    setWasLockGLMAlreadyClosed(true);
    setWasRewardsAlreadyClosed(true);
    setWasWithdrawAlreadyClosed(true);
    setWasAllocateRewardsAlreadyClosed(true);

    expect(useTipsStore.getState().data.wasAddFavouritesAlreadyClosed).toEqual(true);
    expect(useTipsStore.getState().data.wasConnectWalletAlreadyClosed).toEqual(true);
    expect(useTipsStore.getState().data.wasLockGLMAlreadyClosed).toEqual(true);
    expect(useTipsStore.getState().data.wasRewardsAlreadyClosed).toEqual(true);
    expect(useTipsStore.getState().data.wasWithdrawAlreadyClosed).toEqual(true);
    expect(useTipsStore.getState().data.wasAllocateRewardsAlreadyClosed).toEqual(true);

    reset();

    expect(useTipsStore.getState().data.wasAddFavouritesAlreadyClosed).toEqual(false);
    expect(useTipsStore.getState().data.wasConnectWalletAlreadyClosed).toEqual(false);
    expect(useTipsStore.getState().data.wasLockGLMAlreadyClosed).toEqual(false);
    expect(useTipsStore.getState().data.wasRewardsAlreadyClosed).toEqual(false);
    expect(useTipsStore.getState().data.wasWithdrawAlreadyClosed).toEqual(false);
    expect(useTipsStore.getState().data.wasAllocateRewardsAlreadyClosed).toEqual(false);
  });

  it(`should set wasAddFavouritesAlreadyClosed state and localStorage item '${WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP}' to 'true'`, () => {
    const { setWasAddFavouritesAlreadyClosed } = useTipsStore.getState();
    const wasAddFavouritesAlreadyClosed = true;

    setWasAddFavouritesAlreadyClosed(wasAddFavouritesAlreadyClosed);
    expect(localStorage.getItem(WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP)).toEqual(
      JSON.stringify(wasAddFavouritesAlreadyClosed),
    );
    expect(useTipsStore.getState().data.wasAddFavouritesAlreadyClosed).toEqual(
      wasAddFavouritesAlreadyClosed,
    );
  });

  it(`should set wasAddFavouritesAlreadyClosed state and localStorage item '${WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP}' to 'false'`, () => {
    const { setWasAddFavouritesAlreadyClosed } = useTipsStore.getState();
    const wasAddFavouritesAlreadyClosed = false;

    setWasAddFavouritesAlreadyClosed(wasAddFavouritesAlreadyClosed);
    expect(localStorage.getItem(WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP)).toEqual(
      JSON.stringify(wasAddFavouritesAlreadyClosed),
    );
    expect(useTipsStore.getState().data.wasAddFavouritesAlreadyClosed).toEqual(
      wasAddFavouritesAlreadyClosed,
    );
  });

  it(`should set wasConnectWalletAlreadyClosed state and localStorage item '${WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP}' to 'true'`, () => {
    const { setWasConnectWalletAlreadyClosed } = useTipsStore.getState();
    const wasConnectWalletAlreadyClosed = true;

    setWasConnectWalletAlreadyClosed(wasConnectWalletAlreadyClosed);
    expect(localStorage.getItem(WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP)).toEqual(
      JSON.stringify(wasConnectWalletAlreadyClosed),
    );
    expect(useTipsStore.getState().data.wasConnectWalletAlreadyClosed).toEqual(
      wasConnectWalletAlreadyClosed,
    );
  });

  it(`should set wasConnectWalletAlreadyClosed state and localStorage item '${WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP}' to 'false'`, () => {
    const { setWasConnectWalletAlreadyClosed } = useTipsStore.getState();
    const wasConnectWalletAlreadyClosed = false;

    setWasConnectWalletAlreadyClosed(wasConnectWalletAlreadyClosed);
    expect(localStorage.getItem(WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP)).toEqual(
      JSON.stringify(wasConnectWalletAlreadyClosed),
    );
    expect(useTipsStore.getState().data.wasConnectWalletAlreadyClosed).toEqual(
      wasConnectWalletAlreadyClosed,
    );
  });

  it(`should set wasLockGLMAlreadyClosed state and localStorage item '${WAS_LOCK_GLM_ALREADY_CLOSED_TIP}' to 'true'`, () => {
    const { setWasLockGLMAlreadyClosed } = useTipsStore.getState();
    const wasLockGLMAlreadyClosed = true;

    setWasLockGLMAlreadyClosed(wasLockGLMAlreadyClosed);
    expect(localStorage.getItem(WAS_LOCK_GLM_ALREADY_CLOSED_TIP)).toEqual(
      JSON.stringify(wasLockGLMAlreadyClosed),
    );
    expect(useTipsStore.getState().data.wasLockGLMAlreadyClosed).toEqual(wasLockGLMAlreadyClosed);
  });

  it(`should set wasLockGLMAlreadyClosed state and localStorage item '${WAS_LOCK_GLM_ALREADY_CLOSED_TIP}' to 'false'`, () => {
    const { setWasLockGLMAlreadyClosed } = useTipsStore.getState();
    const wasLockGLMAlreadyClosed = false;

    setWasLockGLMAlreadyClosed(wasLockGLMAlreadyClosed);
    expect(localStorage.getItem(WAS_LOCK_GLM_ALREADY_CLOSED_TIP)).toEqual(
      JSON.stringify(wasLockGLMAlreadyClosed),
    );
    expect(useTipsStore.getState().data.wasLockGLMAlreadyClosed).toEqual(wasLockGLMAlreadyClosed);
  });

  it(`should set wasRewardsAlreadyClosed state and localStorage item '${WAS_REWARDS_ALREADY_CLOSED_TIP}' to 'true'`, () => {
    const { setWasRewardsAlreadyClosed } = useTipsStore.getState();
    const wasRewardsAlreadyClosed = true;

    setWasRewardsAlreadyClosed(wasRewardsAlreadyClosed);
    expect(localStorage.getItem(WAS_REWARDS_ALREADY_CLOSED_TIP)).toEqual(
      JSON.stringify(wasRewardsAlreadyClosed),
    );
    expect(useTipsStore.getState().data.wasRewardsAlreadyClosed).toEqual(wasRewardsAlreadyClosed);
  });

  it(`should set wasRewardsAlreadyClosed state and localStorage item '${WAS_REWARDS_ALREADY_CLOSED_TIP}' to 'false'`, () => {
    const { setWasRewardsAlreadyClosed } = useTipsStore.getState();
    const wasRewardsAlreadyClosed = false;

    setWasRewardsAlreadyClosed(wasRewardsAlreadyClosed);
    expect(localStorage.getItem(WAS_REWARDS_ALREADY_CLOSED_TIP)).toEqual(
      JSON.stringify(wasRewardsAlreadyClosed),
    );
    expect(useTipsStore.getState().data.wasRewardsAlreadyClosed).toEqual(wasRewardsAlreadyClosed);
  });

  it(`should set wasWithdrawAlreadyClosed state and localStorage item '${WAS_WITHDRAW_ALREADY_CLOSED_TIP}' to 'true'`, () => {
    const { setWasWithdrawAlreadyClosed } = useTipsStore.getState();
    const wasWithdrawAlreadyClosed = true;

    setWasWithdrawAlreadyClosed(wasWithdrawAlreadyClosed);
    expect(localStorage.getItem(WAS_WITHDRAW_ALREADY_CLOSED_TIP)).toEqual(
      JSON.stringify(wasWithdrawAlreadyClosed),
    );
    expect(useTipsStore.getState().data.wasWithdrawAlreadyClosed).toEqual(wasWithdrawAlreadyClosed);
  });

  it(`should set wasWithdrawAlreadyClosed state and localStorage item '${WAS_WITHDRAW_ALREADY_CLOSED_TIP}' to 'false'`, () => {
    const { setWasWithdrawAlreadyClosed } = useTipsStore.getState();
    const wasWithdrawAlreadyClosed = false;

    setWasWithdrawAlreadyClosed(wasWithdrawAlreadyClosed);
    expect(localStorage.getItem(WAS_WITHDRAW_ALREADY_CLOSED_TIP)).toEqual(
      JSON.stringify(wasWithdrawAlreadyClosed),
    );
    expect(useTipsStore.getState().data.wasWithdrawAlreadyClosed).toEqual(wasWithdrawAlreadyClosed);
  });

  it(`should set wasAllocateRewardsAlreadyClosed state and localStorage item '${WAS_ALLOCATE_REWARDS_ALREADY_CLOSED_TIP}' to 'true'`, () => {
    const { setWasAllocateRewardsAlreadyClosed } = useTipsStore.getState();
    const wasAllocateRewardsAlreadyClosed = true;

    setWasAllocateRewardsAlreadyClosed(wasAllocateRewardsAlreadyClosed);
    expect(localStorage.getItem(WAS_ALLOCATE_REWARDS_ALREADY_CLOSED_TIP)).toEqual(
      JSON.stringify(wasAllocateRewardsAlreadyClosed),
    );
    expect(useTipsStore.getState().data.wasAllocateRewardsAlreadyClosed).toEqual(
      wasAllocateRewardsAlreadyClosed,
    );
  });

  it(`should set wasAllocateRewardsAlreadyClosed state and localStorage item '${WAS_ALLOCATE_REWARDS_ALREADY_CLOSED_TIP}' to 'false'`, () => {
    const { setWasAllocateRewardsAlreadyClosed } = useTipsStore.getState();
    const wasAllocateRewardsAlreadyClosed = false;

    setWasAllocateRewardsAlreadyClosed(wasAllocateRewardsAlreadyClosed);
    expect(localStorage.getItem(WAS_ALLOCATE_REWARDS_ALREADY_CLOSED_TIP)).toEqual(
      JSON.stringify(wasAllocateRewardsAlreadyClosed),
    );
    expect(useTipsStore.getState().data.wasAllocateRewardsAlreadyClosed).toEqual(
      wasAllocateRewardsAlreadyClosed,
    );
  });

  it('should set values from localStorage in state', () => {
    const { setValuesFromLocalStorage } = useTipsStore.getState();

    expect(useTipsStore.getState().meta.isInitialized).toEqual(false);
    setValuesFromLocalStorage();
    expect(useTipsStore.getState().meta.isInitialized).toEqual(true);

    expect(useTipsStore.getState().data.wasAddFavouritesAlreadyClosed).toEqual(false);
    expect(useTipsStore.getState().data.wasConnectWalletAlreadyClosed).toEqual(false);
    expect(useTipsStore.getState().data.wasLockGLMAlreadyClosed).toEqual(false);
    expect(useTipsStore.getState().data.wasRewardsAlreadyClosed).toEqual(false);
    expect(useTipsStore.getState().data.wasWithdrawAlreadyClosed).toEqual(false);
    expect(useTipsStore.getState().data.wasAllocateRewardsAlreadyClosed).toEqual(false);

    const wasAddFavouritesAlreadyClosed = true;
    const wasConnectWalletAlreadyClosed = true;
    const wasLockGLMAlreadyClosed = true;
    const wasRewardsAlreadyClosed = true;
    const wasWithdrawAlreadyClosed = true;
    const wasAllocateRewardsAlreadyClosed = true;

    localStorage.setItem(
      WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP,
      JSON.stringify(wasAddFavouritesAlreadyClosed),
    );
    localStorage.setItem(
      WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP,
      JSON.stringify(wasConnectWalletAlreadyClosed),
    );
    localStorage.setItem(WAS_LOCK_GLM_ALREADY_CLOSED_TIP, JSON.stringify(wasLockGLMAlreadyClosed));
    localStorage.setItem(WAS_REWARDS_ALREADY_CLOSED_TIP, JSON.stringify(wasRewardsAlreadyClosed));
    localStorage.setItem(WAS_WITHDRAW_ALREADY_CLOSED_TIP, JSON.stringify(wasWithdrawAlreadyClosed));
    localStorage.setItem(
      WAS_ALLOCATE_REWARDS_ALREADY_CLOSED_TIP,
      JSON.stringify(wasAllocateRewardsAlreadyClosed),
    );

    setValuesFromLocalStorage();

    expect(useTipsStore.getState().data.wasAddFavouritesAlreadyClosed).toEqual(
      wasAddFavouritesAlreadyClosed,
    );
    expect(useTipsStore.getState().data.wasConnectWalletAlreadyClosed).toEqual(
      wasConnectWalletAlreadyClosed,
    );
    expect(useTipsStore.getState().data.wasLockGLMAlreadyClosed).toEqual(wasLockGLMAlreadyClosed);
    expect(useTipsStore.getState().data.wasRewardsAlreadyClosed).toEqual(wasRewardsAlreadyClosed);
    expect(useTipsStore.getState().data.wasWithdrawAlreadyClosed).toEqual(wasWithdrawAlreadyClosed);
    expect(useTipsStore.getState().data.wasAllocateRewardsAlreadyClosed).toEqual(
      wasAllocateRewardsAlreadyClosed,
    );
  });
});
