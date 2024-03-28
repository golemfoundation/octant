from app.context.epoch_state import EpochState
from app.context.manager import state_context
from app.modules.registry import get_services


def get_user_terms_of_service_consent_status(user_address: str) -> bool:
    context = state_context(EpochState.CURRENT)
    service = get_services(context.epoch_state).user_tos_service

    return service.has_user_agreed_to_terms_of_service(context, user_address)


def post_user_terms_of_service_consent(user_address: str, signature: str, user_ip: str):
    context = state_context(EpochState.CURRENT)
    service = get_services(context.epoch_state).user_tos_service
    service.add_user_terms_of_service_consent(context, user_address, signature, user_ip)
