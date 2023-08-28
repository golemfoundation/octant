from graphql import DocumentNode
from operator import attrgetter

filters = {
    "lte": (lambda compared_value: (lambda v: v <= compared_value)),
    "lt": (lambda compared_value: (lambda v: v < compared_value)),
    "gt": (lambda compared_value: (lambda v: v > compared_value)),
    "gte": (lambda compared_value: (lambda v: v >= compared_value)),
    "": (lambda compared_value: (lambda v: v == compared_value)),
}


class MockGQLClient:
    def __init__(self, withdrawals=None, locks=None, unlocks=None):
        self.withdrawals = withdrawals if withdrawals is not None else []
        self.lockeds = locks if locks is not None else []
        self.unlockeds = unlocks if unlocks is not None else []

    def execute(self, query: DocumentNode, variable_values=None):
        query = query.to_dict()["definitions"][0]
        entity_name, entity = self._extract_entity(query)
        filters = self._extract_filters(query, variable_values)

        filtered_values = filter(filters, entity)

        ordered = self._order_by(filtered_values, query)
        limited = self._limit_result(ordered, query, variable_values)

        return {entity_name: self._filter_returned_fields(limited, query)}

    def _extract_entity(self, query):
        name = query["selection_set"]["selections"][0]["name"]["value"]
        return name, self.__getattribute__(name)

    def _extract_filters(self, query, variables):
        query_arguments = query["selection_set"]["selections"][0]["arguments"]
        where_clause = next(
            (v for v in query_arguments if v["name"]["value"] == "where"), []
        )

        filter_clauses = where_clause["value"]["fields"]

        entity_filters = [
            self._build_filter(filter_clause, variables)
            for filter_clause in filter_clauses
        ]

        return lambda entity: all([f(entity) for f in entity_filters])

    def _build_filter(self, filter_clause, variables):
        filtered_field_spec = filter_clause["name"]["value"]
        filtered_field_spec = filtered_field_spec.split("_")

        filtered_field = filtered_field_spec[0]

        expected_value_spec = (
            filter_clause["value"]["name"]["value"]
            if filter_clause["value"]["kind"] == "variable"
            else None
        )
        expected_value = variables[expected_value_spec]

        filter_name = filtered_field_spec[1] if len(filtered_field_spec) == 2 else ""
        filter_func = filters[filter_name]
        value_filter = filter_func(expected_value)

        return lambda entity: value_filter(entity[filtered_field])

    def _order_by(self, entities, query):
        order_field, reverse = self._extract_order_field(query)
        return sorted(entities, key=lambda e: e[order_field], reverse=reverse)

    def _limit_result(self, entities, query, variables):
        limit = self._extract_limit(query, variables)

        return entities[:limit] if limit is not None else entities

    def _extract_limit(self, query, variables):
        query_arguments = query["selection_set"]["selections"][0]["arguments"]
        limit_clause = next(
            (v for v in query_arguments if v["name"]["value"] == "first"), None
        )

        if limit_clause is None:
            return None

        limit_var_name = (
            limit_clause["value"]["name"]["value"]
            if limit_clause["value"]["kind"] == "variable"
            else None
        )

        return variables[limit_var_name]

    def _extract_order_field(self, query):
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

    def _filter_returned_fields(self, values, query):
        queried_fields = self._extract_queried_fields(query)

        return [self._filtered_fields(v, queried_fields) for v in values]

    def _filtered_fields(self, d: dict, fields):
        result = dict()
        for k, v in d.items():
            if k in fields:
                result[k] = v

        return result

    def _extract_queried_fields(self, query):
        fields_definitions = query["selection_set"]["selections"][0]["selection_set"][
            "selections"
        ]

        return [
            field_definition["name"]["value"] for field_definition in fields_definitions
        ]
