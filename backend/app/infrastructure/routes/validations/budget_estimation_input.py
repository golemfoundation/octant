from app.exceptions import InvalidBudgetEstimationDetails


def validate_budget_estimation_input(**details: dict):
    missing_values = []
    for detail, value in details.items():
        if value is None:
            missing_values.append(detail)

    if len(missing_values) > 0:
        raise InvalidBudgetEstimationDetails(missing_values)
