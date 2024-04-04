from app.context.manager import epoch_context
from app.modules.registry import get_services
from app.modules.dto import ProjectsMetadata


def get_projects_metadata(epoch: int) -> ProjectsMetadata:
    context = epoch_context(epoch)
    service = get_services(context.epoch_state).projects_metadata_service
    return service.get_projects_metadata(context)
