from app.context.epoch_details import EpochDetails


def test_check_if_epoch_details_gets_blocks_when_mainnet(patch_etherscan_get_block_api):
    mocked_etherscan_block = 12712551
    epoch_details = EpochDetails(1, 1, 1, 1, with_block_range=True)

    assert epoch_details.start_block == mocked_etherscan_block
    assert epoch_details.end_block == mocked_etherscan_block


def test_check_if_epoch_details_gets_blocks_when_not_mainnet():
    epoch_details = EpochDetails(1, 1, 1, 1, with_block_range=False)

    assert epoch_details.start_block is None
    assert epoch_details.end_block is None
