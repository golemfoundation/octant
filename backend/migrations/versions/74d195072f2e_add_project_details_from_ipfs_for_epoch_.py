"""Add project details from IPFS for Epoch 1

Revision ID: 74d195072f2e
Revises: 19d9995b2ced
Create Date: 2024-09-19 10:52:31.495491

"""
from alembic import op

from migrations.ipfs_integration.migration_helpers import (
    get_json_path,
    load_json_data,
    prepare_project_upsert_query,
    prepare_delete_project_query,
)

revision = "74d195072f2e"
down_revision = "19d9995b2ced"
branch_labels = None
depends_on = None

EPOCH = 1
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
