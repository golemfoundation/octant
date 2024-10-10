"""Add projects details from IPFS for Epoch 5

Revision ID: 2060b4c232c6
Revises: c34003767fa8
Create Date: 2024-10-09 22:58:18.845671

"""
from migrations.ipfs_integration import migration_helpers as ipfs_migration


revision = "2060b4c232c6"
down_revision = "c34003767fa8"
branch_labels = None
depends_on = None


FILENAME = "ipfs_projects_details_epoch_{}.json"
EPOCHS = (5,)


def upgrade():
    for epoch in EPOCHS:
        filename = FILENAME.format(epoch)
        ipfs_migration.upgrade(filename, epoch)


def downgrade():
    for epoch in EPOCHS:
        filename = FILENAME.format(epoch)
        ipfs_migration.downgrade(filename, epoch)

