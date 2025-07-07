"""E8: Add project details for search

Revision ID: 6c3af63d69f8
Revises: bfd76a2b13a8
Create Date: 2025-07-07 16:40:40.191916

"""
from migrations.ipfs_integration import migration_helpers as ipfs_migration

# revision identifiers, used by Alembic.
revision = "6c3af63d69f8"
down_revision = "bfd76a2b13a8"
branch_labels = None
depends_on = None

FILENAME = "ipfs_projects_details_epoch_{}.json"
EPOCH = 8


def upgrade():
    filename = FILENAME.format(EPOCH)
    ipfs_migration.upgrade(filename, EPOCH)


def downgrade():
    filename = FILENAME.format(EPOCH)
    ipfs_migration.downgrade(filename, EPOCH)