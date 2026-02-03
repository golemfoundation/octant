"""E10: Add project details for search

Revision ID: 8c5e2a1f4b7d
Revises: e2f4c1a7b8d9
Create Date: 2026-02-03 13:36:41.642611

"""
from migrations.ipfs_integration import migration_helpers as ipfs_migration

# revision identifiers, used by Alembic.
revision = "8c5e2a1f4b7d"
down_revision = "e2f4c1a7b8d9"
branch_labels = None
depends_on = None

FILENAME = "ipfs_projects_details_epoch_{}.json"
EPOCH = 11


def upgrade():
    filename = FILENAME.format(EPOCH)
    ipfs_migration.upgrade(filename, EPOCH)


def downgrade():
    filename = FILENAME.format(EPOCH)
    ipfs_migration.downgrade(filename, EPOCH)
