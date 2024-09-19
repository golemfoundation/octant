"""Add project details from IPFS for Epoch 2

Revision ID: 216381a661df
Revises: 74d195072f2e
Create Date: 2024-09-19 10:55:48.699651

"""
from alembic import op

from migrations.ipfs_integration.migration_helpers import (
    get_json_path,
    load_json_data,
    prepare_delete_project_query,
    prepare_project_upsert_query,
)

revision = "216381a661df"
down_revision = "74d195072f2e"
branch_labels = None
depends_on = None


EPOCH = 2
FILENAME = f"ipfs_projects_details_epoch_{EPOCH}.json"


def upgrade():
    json_filepath = get_json_path(FILENAME)
    project_data = load_json_data(json_filepath)

    for project in project_data:
        query = prepare_project_upsert_query(project, EPOCH)
        op.execute(query)


def downgrade():
    json_filepath = get_json_path(FILENAME)
    project_data = load_json_data(json_filepath)

    for project in project_data:
        query = prepare_delete_project_query(project, EPOCH)
        op.execute(query)
