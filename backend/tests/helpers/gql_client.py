from graphql import DocumentNode

from tests.helpers.constants import (
    ALICE_SABLIER_LOCKING_ADDRESS,
    BOB_SABLIER_LOCKING_ADDRESS,
)

filters = {
    "lte": (lambda compared_value: (lambda v: v <= compared_value)),
    "lt": (lambda compared_value: (lambda v: v < compared_value)),
    "gt": (lambda compared_value: (lambda v: v > compared_value)),
    "gte": (lambda compared_value: (lambda v: v >= compared_value)),
    "": (lambda compared_value: (lambda v: v == compared_value)),
}


class MockGQLClient:
    def __init__(
        self,
        withdrawals=None,
        lockeds=None,
        unlockeds=None,
        epoches=None,
        merkle_roots=None,
    ):
        self.withdrawals = withdrawals if withdrawals is not None else []
        self.epoches = epoches if epoches is not None else []
        self.lockeds = lockeds if lockeds is not None else []
        self.unlockeds = unlockeds if unlockeds is not None else []
        self.vaultMerkleRoots = merkle_roots if merkle_roots is not None else []
        self._bytes_to_lowercase()

    def execute(self, query: DocumentNode, variable_values=None):
        query = query.to_dict()["definitions"][0]
        entity_name, entity = self._extract_entity(query)
        filters = MockGQLClient._extract_filters(query, variable_values)

        filtered_values = filter(filters, entity)

        ordered = MockGQLClient._order_by(filtered_values, query)
        limited = MockGQLClient._limit_result(ordered, query, variable_values)

        return {entity_name: MockGQLClient._filter_returned_fields(limited, query)}

    def _extract_entity(self, query):
        name = query["selection_set"]["selections"][0]["name"]["value"]
        return name, self.__getattribute__(name)

    @staticmethod
    def _extract_filters(query, variables):
        query_arguments = query["selection_set"]["selections"][0]["arguments"]
        where_clause = next(
            (v for v in query_arguments if v["name"]["value"] == "where"), {}
        )

        entity_filters = []
        if where_clause:
            filter_clauses = where_clause["value"]["fields"]

            entity_filters = [
                MockGQLClient._build_filter(filter_clause, variables)
                for filter_clause in filter_clauses
            ]

        return lambda entity: all([f(entity) for f in entity_filters])

    @staticmethod
    def _build_filter(filter_clause, variables):
        filtered_field_spec = filter_clause["name"]["value"]
        filtered_field_spec = filtered_field_spec.split("_")

        filtered_field = filtered_field_spec[0]

        expected_value_spec = (
            filter_clause["value"]["name"]["value"]
            if filter_clause["value"]["kind"] == "variable"
            else None
        )
        expected_value = variables[expected_value_spec]

        # subgraph compares hex encoded data bytewise, so address checksums should be disregarded
        if isinstance(expected_value, str) and expected_value.startswith("0x"):
            expected_value = expected_value.lower()

        filter_name = filtered_field_spec[1] if len(filtered_field_spec) == 2 else ""
        filter_func = filters[filter_name]
        value_filter = filter_func(expected_value)

        return lambda entity: value_filter(entity[filtered_field])

    @staticmethod
    def _order_by(entities, query):
        order_field, reverse = MockGQLClient._extract_order_field(query)
        if order_field is not None:
            return sorted(entities, key=lambda e: e[order_field], reverse=reverse)
        else:
            return entities

    @staticmethod
    def _limit_result(entities, query, variables):
        limit = MockGQLClient._extract_limit(query, variables)

        return list(entities)[:limit] if limit is not None else entities

    @staticmethod
    def _extract_limit(query, variables):
        query_arguments = query["selection_set"]["selections"][0]["arguments"]
        limit_clause = next(
            (v for v in query_arguments if v["name"]["value"] == "first"), None
        )

        if limit_clause is None:
            return None

        if limit_clause["value"]["kind"] == "int_value":
            return int(limit_clause["value"]["value"])

        limit_var_name = (
            limit_clause["value"]["name"]["value"]
            if limit_clause["value"]["kind"] == "variable"
            else None
        )

        return variables[limit_var_name]

    @staticmethod
    def _extract_order_field(query):
        query_arguments = query["selection_set"]["selections"][0]["arguments"]
        order_clause = next(
            (v for v in query_arguments if v["name"]["value"] == "orderBy"), None
        )
        order_direction_clause = next(
            (v for v in query_arguments if v["name"]["value"] == "orderDirection"), None
        )

        order_field = (
            order_clause["value"]["value"] if order_clause is not None else None
        )
        order_dir = (
            order_direction_clause["value"]["value"]
            if order_direction_clause is not None
            else "asc"
        )

        is_reverse = order_dir == "desc"

        return order_field, is_reverse

    @staticmethod
    def _filter_returned_fields(values, query):
        queried_fields = MockGQLClient._extract_queried_fields(query)

        return [MockGQLClient._filtered_fields(v, queried_fields) for v in values]

    @staticmethod
    def _filtered_fields(d: dict, fields):
        result = dict()
        for k, v in d.items():
            if k in fields:
                result[k] = v

        return result

    @staticmethod
    def _extract_queried_fields(query):
        fields_definitions = query["selection_set"]["selections"][0]["selection_set"][
            "selections"
        ]

        return [
            field_definition["name"]["value"] for field_definition in fields_definitions
        ]

    @staticmethod
    def _user_to_lower(event):
        event["user"] = event["user"].lower()
        return event

    def _bytes_to_lowercase(self):
        self.withdrawals = list(map(MockGQLClient._user_to_lower, self.withdrawals))
        self.lockeds = list(map(MockGQLClient._user_to_lower, self.lockeds))
        self.unlockeds = list(map(MockGQLClient._user_to_lower, self.unlockeds))


class MockSablierGQLClient:
    def execute(self, query: DocumentNode, variable_values=None):
        recipient = variable_values.get("recipient")
        if recipient is None:
            payload = self._prepare_payload(ALICE_SABLIER_LOCKING_ADDRESS)
            payload["streams"] += self._prepare_payload(BOB_SABLIER_LOCKING_ADDRESS)[
                "streams"
            ]
        else:
            payload = self._prepare_payload(recipient)

        return payload

    def _prepare_payload(self, recipient):
        result = {"streams": []}

        actions = [
            {
                "addressA": "0x76273dcc41356e5f0c49bb68e525175dc7e83417",
                "addressB": recipient,
                "amountA": "10000000000000000000",
                "amountB": None,
                "category": "Create",
                "hash": "0xe4395aa03aaf8bb3d2d8009106cc2a5049f9afde8a5b19bb70d3e19660eae43b",
                "timestamp": "1726833047",
            },
            {
                "addressA": recipient,
                "addressB": recipient,
                "amountA": None,
                "amountB": "355443302891933020",
                "category": "Withdraw",
                "hash": "0x685ec53bdcbaca88d87438b33f6c82b3720937126db1d3982cfd62a9bf71b138",
                "timestamp": "1729075199",
            },
            {
                "addressA": "0x76273dcc41356e5f0c49bb68e525175dc7e83417",
                "addressB": recipient,
                "amountA": "9644339802130898030",
                "amountB": "216894977168950",
                "category": "Cancel",
                "hash": "0x244c9de88860320b89575a0d8f62f9eb5c7ba4597947ac63f94b6ef0db354b83",
                "timestamp": "1729076267",
            },
            {
                "addressA": recipient,
                "addressB": recipient,
                "amountA": None,
                "amountB": "216894977168950",
                "category": "Withdraw",
                "hash": "0xcdf10032cf3bc74a255510e632d4e7fe876503bc2ec04c8d79dce714492ad11d",
                "timestamp": "1729077035",
            },
        ]

        if recipient in [ALICE_SABLIER_LOCKING_ADDRESS, BOB_SABLIER_LOCKING_ADDRESS]:
            result = {
                "streams": [
                    {
                        "actions": actions,
                        "id": "0x3962f6585946823440d274ad7c719b02b49de51e-1-1147",
                        "intactAmount": "0",
                        "transferable": False,
                    }
                ]
            }

        return result
