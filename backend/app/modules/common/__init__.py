def parse_bool(value: str) -> bool:
    return value.lower() in ["true", "1"] if value is not None else False
