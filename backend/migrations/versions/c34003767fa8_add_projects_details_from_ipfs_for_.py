"""Add projects details from IPFS for Epoch 1, 2, 3 and 4

Revision ID: c34003767fa8
Revises: 87b2cefcfa11
Create Date: 2024-09-20 11:14:31.965331

"""
from migrations.ipfs_integration import migration_helpers as ipfs_migration

revision = "c34003767fa8"
down_revision = "87b2cefcfa11"
branch_labels = None
depends_on = None

FILENAME = "ipfs_projects_details_epoch_{}.json"
EPOCHS = (1, 2, 3, 4)


def upgrade():
    for epoch in EPOCHS:
        filename = FILENAME.format(epoch)
        ipfs_migration.upgrade(filename, epoch)


def downgrade():
    for epoch in EPOCHS:
        filename = FILENAME.format(epoch)
        ipfs_migration.downgrade(filename, epoch)
