"""Add project details from IPFS for Epoch 3

Revision ID: ec2856375356
Revises: 216381a661df
Create Date: 2024-09-19 10:56:54.229351

"""
from alembic import op

from migrations.ipfs_integration.migration_helpers import (
    get_json_path,
    load_json_data,
    prepare_project_upsert_query,
    prepare_delete_project_query,
)

revision = "ec2856375356"
down_revision = "216381a661df"
branch_labels = None
depends_on = None

EPOCH = 3
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
