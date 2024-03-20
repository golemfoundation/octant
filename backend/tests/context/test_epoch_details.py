from freezegun import freeze_time

from app.context.epoch_details import EpochDetails


def test_check_if_epoch_details_gets_blocks_when_mainnet(patch_etherscan_get_block_api):
    mocked_etherscan_block = 12712551
    epoch_details = EpochDetails(1, 1, 1, 1, with_block_range=True)

    assert epoch_details.start_block == mocked_etherscan_block
    assert epoch_details.end_block == mocked_etherscan_block


def test_check_if_epoch_details_does_not_get_blocks_when_not_mainnet():
    epoch_details = EpochDetails(1, 1, 1, 1, with_block_range=False)

    assert epoch_details.start_block is None
    assert epoch_details.end_block is None


def test_check_if_epoch_details_gets_blocks_when_not_simulated(
    patch_etherscan_get_block_api,
):
    mocked_etherscan_block = 12712551

    epoch_details = EpochDetails(
        1, 1, 100, 1, with_block_range=True, current_epoch_simulated=False
    )

    assert epoch_details.start_block == mocked_etherscan_block
    assert epoch_details.end_block == mocked_etherscan_block


def test_check_if_epoch_details_gets_blocks_when_current_simulated(
    patch_etherscan_get_block_api,
):
    mocked_etherscan_block = 12712551

    epoch_details = EpochDetails(
        1, 1, 100, 1, with_block_range=True, current_epoch_simulated=True
    )

    assert epoch_details.start_block == mocked_etherscan_block
    assert epoch_details.end_block == mocked_etherscan_block


@freeze_time("2024-03-14 02:12:00")
def test_check_if_attributes_are_correctly_set_when_current_simulated():
    mocked_now_ts = 1710382320
    mocked_start_sec = 1
    mocked_decision_window = 10
    epoch_details = EpochDetails(
        epoch_num=1,
        start=mocked_start_sec,
        duration=None,
        decision_window=mocked_decision_window,
        with_block_range=False,
        current_epoch_simulated=True,
    )

    assert epoch_details.epoch_num == 1
    assert epoch_details.start_sec == mocked_start_sec
    assert epoch_details.end_sec == mocked_now_ts
    assert epoch_details.duration_sec == mocked_now_ts - mocked_start_sec
    assert epoch_details.remaining_sec == 0
    assert epoch_details.finalized_sec == mocked_now_ts + mocked_decision_window
    assert epoch_details.start_block is None
    assert epoch_details.end_block is None
