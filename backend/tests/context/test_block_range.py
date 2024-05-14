import pytest

from app.context.epoch.block_range import get_blocks_range


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_get_block_range(patch_etherscan_get_block_api):
    mocked_etherscan_block = 12712551
    start, end = get_blocks_range(1, 2, 2, with_block_range=True)

    assert start == mocked_etherscan_block
    assert end == mocked_etherscan_block


def test_does_not_get_block_range():
    start, end = get_blocks_range(1, 2, 2, with_block_range=False)

    assert start is None
    assert end is None


def test_end_is_none_when_its_in_the_future(patch_etherscan_get_block_api):
    mocked_etherscan_block = 12712551
    start, end = get_blocks_range(1, 3, 2, with_block_range=True)

    assert start == mocked_etherscan_block
    assert end is None


def test_start_and_end_is_none_when_its_in_the_future():
    start, end = get_blocks_range(2, 3, 1, with_block_range=True)

    assert start is None
    assert end is None
