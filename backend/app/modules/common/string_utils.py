def parse_cids_to_epochs_dict(cids_str: str) -> dict[int, str]:
    return {
        index: element.strip()
        for index, element in enumerate(cids_str.split(","), start=1)
    }
