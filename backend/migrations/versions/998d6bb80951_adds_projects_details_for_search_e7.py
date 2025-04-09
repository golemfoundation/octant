"""Adds projects details for search e7

Revision ID: 998d6bb80951
Revises: c737027a131a
Create Date: 2025-04-07 15:07:56.793832

"""
from migrations.ipfs_integration import migration_helpers as ipfs_migration

# revision identifiers, used by Alembic.
revision = "998d6bb80951"
down_revision = "c737027a131a"
branch_labels = None
depends_on = None

FILENAME = "ipfs_projects_details_epoch_{}.json"
EPOCH = 7


def upgrade():
    filename = FILENAME.format(EPOCH)
    ipfs_migration.upgrade(filename, EPOCH)


def downgrade():
    filename = FILENAME.format(EPOCH)
    ipfs_migration.downgrade(filename, EPOCH)
