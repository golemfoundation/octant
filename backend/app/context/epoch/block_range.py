from typing import Optional

from app.infrastructure.external_api.etherscan.blocks import get_block_num_from_ts


def get_blocks_range(
    start_sec: int,
    end_sec: int,
    now_sec: int,
    with_block_range: bool = False,
) -> tuple[Optional[int], Optional[int]]:
    if not with_block_range:
        return None, None

    start_block = get_block_num_from_ts(start_sec) if start_sec <= now_sec else None
    end_block = get_block_num_from_ts(end_sec) if end_sec <= now_sec else None

    return start_block, end_block
