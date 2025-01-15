"""Add project details from IPFS for Epoch 6

Revision ID: 2e1e54ed62d3
Revises: 5398b1538a31
Create Date: 2025-01-09 10:11:38.296552

"""
from migrations.ipfs_integration import migration_helpers as ipfs_migration

revision = "2e1e54ed62d3"
down_revision = "5398b1538a31"
branch_labels = None
depends_on = None

FILENAME = "ipfs_projects_details_epoch_{}.json"
EPOCHS = (6,)


def upgrade():
    for epoch in EPOCHS:
        filename = FILENAME.format(epoch)
        ipfs_migration.upgrade(filename, epoch)


def downgrade():
    for epoch in EPOCHS:
        filename = FILENAME.format(epoch)
        ipfs_migration.downgrade(filename, epoch)
