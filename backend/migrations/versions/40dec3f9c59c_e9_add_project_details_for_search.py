"""E9: Add project details for search

Revision ID: 40dec3f9c59c
Revises: b5d0a4e49513
Create Date: 2025-10-03 11:54:35.415179

"""
from migrations.ipfs_integration import migration_helpers as ipfs_migration


revision = "40dec3f9c59c"
down_revision = "b5d0a4e49513"
branch_labels = None
depends_on = None

FILENAME = "ipfs_projects_details_epoch_{}.json"
EPOCH = 9


def upgrade():
    filename = FILENAME.format(EPOCH)
    ipfs_migration.upgrade(filename, EPOCH)


def downgrade():
    filename = FILENAME.format(EPOCH)
    ipfs_migration.downgrade(filename, EPOCH)
