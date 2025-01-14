from app.infrastructure.database.models import ProjectsDetails


def parse_cids_to_epochs_dict(cids: list[str]) -> dict[int, str]:
    """
    Convert a list of CIDs to a dictionary mapping epochs to CIDs.
    """
    return {index: cid.strip() for index, cid in enumerate(cids, start=1)}


def process_search_params(
    epochs: str,
    search_phrases: str = "",
) -> tuple[list[int], list[str]]:
    """
    Process and validate the input parameters.
    Returns a tuple of (epoch_list, search_phrases_list)
    """
    epoch_list = [int(e) for e in epochs.split(",")]
    search_phrases_list = search_phrases.split(",") if search_phrases else [""]
    return epoch_list, search_phrases_list


def filter_projects_details(
    projects_details: list[ProjectsDetails], search_phrase: str
) -> list[ProjectsDetails]:
    """
    Filter projects details by search phrase.
    """
    search_phrase = search_phrase.strip().lower()

    filtered_project_details = []

    for project_details in projects_details:
        if (
            search_phrase in project_details.name.lower()
            or search_phrase in project_details.address.lower()
        ):
            filtered_project_details.append(project_details)

    return filtered_project_details
