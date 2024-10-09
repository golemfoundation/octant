from typing import Dict, List

UnlockedsSchema = List[Dict[str, str | int]]
LockedsSchema = List[Dict[str, str | int]]
TransfersSchema = List[Dict[str, str]]
AccumulatedTransfersSchema = Dict[str, Dict[str, str | int]]
TransferDetailsSchema = Dict[str, int]
