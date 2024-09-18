"""Add project details from IPFS

Revision ID: 5daad3b8d796
Revises: 2a116ab607a5
Create Date: 2024-09-18 13:24:49.114014

"""
from alembic import op

from migrations.ipfs_integration.migration_helpers import (
    load_json_data,
    get_json_path,
    prepare_project_upsert_query,
    prepare_delete_project_query,
)

revision = "5daad3b8d796"
down_revision = "2a116ab607a5"
branch_labels = None
depends_on = None

FILENAME = "ipfs_projects_details_18_09_2024.json"


def upgrade():
    json_filepath = get_json_path(FILENAME)
    project_data = load_json_data(json_filepath)

    for project in project_data:
        query = prepare_project_upsert_query(project)
        op.execute(query)


def downgrade():
    json_filepath = get_json_path(FILENAME)
    project_data = load_json_data(json_filepath)

    for project in project_data:
        query = prepare_delete_project_query(project)
        op.execute(query)
