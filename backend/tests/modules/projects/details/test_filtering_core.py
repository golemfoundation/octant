from app.modules.projects.details.core import filter_projects_details
from tests.modules.projects.helpers import sample_projects_details

SAMPLE_PROJECTS_DETAILS = sample_projects_details()


def test_filter_projects_partial_match_in_name():
    """Test that partial matches in the project name are correctly filtered."""
    search_phrase = "Octant"
    filtered_projects = filter_projects_details(SAMPLE_PROJECTS_DETAILS, search_phrase)

    assert len(filtered_projects) == 2
    assert filtered_projects[0].name == "OctantProject3"
    assert filtered_projects[1].name == "OctantTestProject4"


def test_filter_projects_partial_match_in_address():
    """Test that partial matches in the project address are correctly filtered."""
    search_phrase = "0x111"
    filtered_projects = filter_projects_details(SAMPLE_PROJECTS_DETAILS, search_phrase)

    assert len(filtered_projects) == 1
    assert filtered_projects[0].address == "0x111"
    assert filtered_projects[0].name == "TEST1"


def test_filter_projects_empty_search_phrase():
    """Test that all projects are returned when search phrase is empty."""
    search_phrase = ""
    filtered_projects = filter_projects_details(SAMPLE_PROJECTS_DETAILS, search_phrase)

    assert len(filtered_projects) == len(SAMPLE_PROJECTS_DETAILS)
    assert all(project in filtered_projects for project in SAMPLE_PROJECTS_DETAILS)


def test_filter_projects_special_characters_in_search_phrase():
    """Test that search phrases with special characters work correctly."""
    search_phrase = "0x444"
    filtered_projects = filter_projects_details(SAMPLE_PROJECTS_DETAILS, search_phrase)

    assert len(filtered_projects) == 1
    assert filtered_projects[0].address == "0x444"
    assert filtered_projects[0].name == "OctantTestProject4"


def test_filter_projects_search_phrase_not_in_name_or_address():
    """Test that no projects are returned when search phrase doesn't match anything."""
    search_phrase = "NonExistentProject"
    filtered_projects = filter_projects_details(SAMPLE_PROJECTS_DETAILS, search_phrase)

    assert len(filtered_projects) == 0


def test_filter_projects_multiple_matches():
    """Test that multiple projects are returned when search phrase matches multiple names/addresses."""
    search_phrase = "Project"
    filtered_projects = filter_projects_details(SAMPLE_PROJECTS_DETAILS, search_phrase)

    assert len(filtered_projects) == 2
    assert filtered_projects[0].name == "OctantProject3"
    assert filtered_projects[1].name == "OctantTestProject4"


def test_filter_projects_whitespace_in_search_phrase():
    """Test that leading/trailing whitespace in search phrase is handled correctly."""
    search_phrase = "  TEST1  "
    filtered_projects = filter_projects_details(SAMPLE_PROJECTS_DETAILS, search_phrase)

    assert len(filtered_projects) == 1
    assert filtered_projects[0].name == "TEST1"
    assert filtered_projects[0].address == "0x111"
