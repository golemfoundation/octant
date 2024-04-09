from flask import current_app as app
from app.context.manager import epoch_context
from app.shared.blockchain_types import compare_blockchain_types, ChainTypes
from app.modules.registry import get_services
from app.modules.dto import ProjectsMetadata


def get_projects_metadata(epoch: int) -> ProjectsMetadata:
    context = epoch_context(epoch)
    service = get_services(context.epoch_state).projects_metadata_service
    is_mainnet = compare_blockchain_types(app.config["CHAIN_ID"], ChainTypes.MAINNET)
    return service.get_projects_metadata(context, is_mainnet)
