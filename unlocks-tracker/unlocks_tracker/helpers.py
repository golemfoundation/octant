from copy import deepcopy

from schemas import LockedsSchema, UnlockedsSchema


def cast_to_int(original: UnlockedsSchema | LockedsSchema, *keys):
    copy = deepcopy(original)
    for row in copy:
        for key in keys:
            row[key] = int(row[key])

    return copy


def are_addresses_the_same(*addresses):
    return len(set(map(lambda word: word.lower(), addresses))) == 1
