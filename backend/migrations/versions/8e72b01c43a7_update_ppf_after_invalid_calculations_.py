"""Update PPF after invalid calculations for Epoch3

Revision ID: 8e72b01c43a7
Revises: fc7a01c20be5
Create Date: 2024-04-19 00:48:12.133033

"""
from alembic import op
from decimal import Decimal

revision = "8e72b01c43a7"
down_revision = "fc7a01c20be5"
branch_labels = None
depends_on = None

individual_rewards = Decimal(
    "146655862334541166188"
)  # Got directly from the database for Pending Snapshot in Epoch3
staking_proceeds = Decimal(
    "959848624830407629247"
)  # Got directly from the database for Pending Snapshot in Epoch3
ppf = int(staking_proceeds * Decimal("0.35") - individual_rewards)


def upgrade():
    query = f"UPDATE pending_epoch_snapshots SET ppf = '{ppf}' WHERE epoch = 3 AND vanilla_individual_rewards = '{individual_rewards}' AND eth_proceeds = '{staking_proceeds}';"
    op.execute(query)


def downgrade():
    old_ppf = "335947018690642670236"

    query = f"UPDATE pending_epoch_snapshots SET ppf = '{old_ppf}' WHERE epoch = 3 AND vanilla_individual_rewards = '{individual_rewards}' AND eth_proceeds = '{staking_proceeds}' AND ppf = '{ppf}';"

    print(query, flush=True)

    op.execute(query)
