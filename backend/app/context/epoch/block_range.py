from typing import Optional

from app.context.helpers import check_if_future
from app.infrastructure.external_api.etherscan.blocks import get_block_num_from_ts


def get_blocks_range(
    start_sec: int,
    end_sec: int,
    **kwargs,
) -> tuple[Optional[int], Optional[int]]:
    if not kwargs.get("with_block_range"):
        return None, None

    is_start_future = check_if_future(start_sec)
    is_end_future = check_if_future(end_sec)

    start_block = get_block_num_from_ts(start_sec) if not is_start_future else None
    end_block = get_block_num_from_ts(end_sec) if not is_end_future else None

    return start_block, end_block
