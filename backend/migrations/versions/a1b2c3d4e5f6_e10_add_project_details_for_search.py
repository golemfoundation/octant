"""E10: Add project details for search

Revision ID: a1b2c3d4e5f6
Revises: 40dec3f9c59c
Create Date: 2025-12-22 11:31:29.147255

"""
from migrations.ipfs_integration import migration_helpers as ipfs_migration

revision = "a1b2c3d4e5f6"
down_revision = "40dec3f9c59c"
branch_labels = None
depends_on = None

FILENAME = "ipfs_projects_details_epoch_{}.json"
EPOCH = 10

def upgrade():
    filename = FILENAME.format(EPOCH)
    ipfs_migration.upgrade(filename, EPOCH)

def downgrade():
    filename = FILENAME.format(EPOCH)
    ipfs_migration.downgrade(filename, EPOCH)