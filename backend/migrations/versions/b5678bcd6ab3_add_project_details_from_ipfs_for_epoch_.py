"""Add project details from IPFS for Epoch 4

Revision ID: b5678bcd6ab3
Revises: ec2856375356
Create Date: 2024-09-19 10:57:57.418013

"""
from alembic import op
import sqlalchemy as sa

from migrations.ipfs_integration.migration_helpers import (
    get_json_path,
    load_json_data,
    prepare_project_upsert_query,
    prepare_delete_project_query,
)


revision = "b5678bcd6ab3"
down_revision = "ec2856375356"
branch_labels = None
depends_on = None

EPOCH = 4
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
