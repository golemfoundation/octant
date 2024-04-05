
def parse_cids_to_epochs_dict(cidsStr: str) -> dict[int, str]:
    result: dict[int, str] = {}
    elements = cidsStr.split(',')
    for index, element in enumerate(elements, start=1):
        result[index] = element.strip()
    return result