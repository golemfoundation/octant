"""update existing users default allocation nonce to null

Revision ID: 4d1fb6176df7
Revises: 5d527978012e
Create Date: 2023-10-19 11:24:17.909296

"""
from alembic import op
from sqlalchemy import orm

from app.infrastructure.database.models import User

# revision identifiers, used by Alembic.
revision = "4d1fb6176df7"
down_revision = "5d527978012e"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    session = orm.Session(bind=bind)

    for user in session.query(User).filter(User.allocation_nonce == 0).all():
        user.allocation_nonce = None

    session.commit()


def downgrade():
    bind = op.get_bind()
    session = orm.Session(bind=bind)

    for user in session.query(User).filter(User.allocation_nonce.is_(None)).all():
        user.allocation_nonce = 0

    session.commit()
