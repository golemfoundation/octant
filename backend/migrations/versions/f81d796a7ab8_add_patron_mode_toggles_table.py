"""add patron mode toggles table

Revision ID: f81d796a7ab8
Revises: 4371054aa069
Create Date: 2023-12-04 01:55:29.065104

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import orm

from datetime import datetime
from app.infrastructure.database import PatronModeEvent
from eth_utils import to_checksum_address


# revision identifiers, used by Alembic.
revision = "f81d796a7ab8"
down_revision = "4371054aa069"
branch_labels = None
depends_on = None


def events():
    events = [
        (
            "0x0dd5AE26D3d2A742bC50010A486551B0F004147A",
            True,
            "2023-12-04T00:47:46.895510356Z",
        ),
        (
            "0xF1659A2FD5007192314F9676e6a4a39FD1202160",
            True,
            "2023-11-08T07:32:53.124486120Z",
        ),
        (
            "0x67243d6c3c3bDc2F59D2f74ba1949a02973a529d",
            False,
            "2023-11-02T22:15:15.384190194Z",
        ),
        (
            "0x67243d6c3c3bDc2F59D2f74ba1949a02973a529d",
            True,
            "2023-11-02T22:10:26.916761534Z",
        ),
        (
            "0x76E059C6FF6bf9FFFD5f33AFdf4AB2FD511C9DF4",
            True,
            "2023-11-01T12:00:36.150241700Z",
        ),
        (
            "0x3b6CCE32ba37fA5689Fab313371Dcf044ECeF536",
            True,
            "2023-10-31T21:00:31.243174987Z",
        ),
        (
            "0xb150c9bEd10a8C62997d58a81c4e1fA75160643e",
            True,
            "2023-10-31T19:51:57.426025696Z",
        ),
        (
            "0x3B981fA5dD50237dAb6F96A417A6690B6f20FcC4",
            True,
            "2023-10-31T19:16:10.896487716Z",
        ),
        (
            "0x9e602c1920443F01Cb100a57A7F894df8Eb42f66",
            True,
            "2023-10-31T19:13:53.542468549Z",
        ),
        (
            "0x212647c56BA10ee429a838bc567dFb03A8D054Ba",
            True,
            "2023-10-31T18:04:51.240754325Z",
        ),
        (
            "0xafA3E6E29D99337b166b83fB24bA17b19764B49D",
            True,
            "2023-10-31T11:25:42.750309267Z",
        ),
        (
            "0x2383A8b8cC8561a65871F1d2783B7C52e22B62c1",
            True,
            "2023-10-30T19:46:28.702493876Z",
        ),
        (
            "0xB7349056D40C614Fe3D54D3cf4df98b57BBf66F0",
            True,
            "2023-10-29T10:44:54.586907522Z",
        ),
        (
            "0xafA3E6E29D99337b166b83fB24bA17b19764B49D",
            False,
            "2023-10-26T08:14:56.855731488Z",
        ),
        (
            "0xafA3E6E29D99337b166b83fB24bA17b19764B49D",
            True,
            "2023-10-24T13:45:01.529232024Z",
        ),
        (
            "0xafA3E6E29D99337b166b83fB24bA17b19764B49D",
            False,
            "2023-10-23T10:39:55.734269274Z",
        ),
        (
            "0xafA3E6E29D99337b166b83fB24bA17b19764B49D",
            True,
            "2023-10-23T10:39:44.682103354Z",
        ),
        (
            "0xafA3E6E29D99337b166b83fB24bA17b19764B49D",
            False,
            "2023-10-23T10:08:38.143287818Z",
        ),
        (
            "0xafA3E6E29D99337b166b83fB24bA17b19764B49D",
            True,
            "2023-10-23T10:08:20.212595966Z",
        ),
        (
            "0x0dd5AE26D3d2A742bC50010A486551B0F004147A",
            False,
            "2023-10-23T07:08:54.588705791Z",
        ),
        (
            "0x815af1BC8D75EcA1e86a70215Dca7958687aeD7b",
            True,
            "2023-10-22T03:01:03.409124339Z",
        ),
        (
            "0xDd31dB93082a3A71b98D37ba26230f8734Bd63C3",
            True,
            "2023-10-21T16:07:26.979639361Z",
        ),
        (
            "0xafA3E6E29D99337b166b83fB24bA17b19764B49D",
            False,
            "2023-10-20T14:26:04.185428151Z",
        ),
        (
            "0xafA3E6E29D99337b166b83fB24bA17b19764B49D",
            True,
            "2023-10-20T14:15:43.335465037Z",
        ),
        (
            "0xafA3E6E29D99337b166b83fB24bA17b19764B49D",
            False,
            "2023-10-20T10:28:49.965547938Z",
        ),
        (
            "0xafA3E6E29D99337b166b83fB24bA17b19764B49D",
            True,
            "2023-10-20T10:28:29.267494907Z",
        ),
        (
            "0xafA3E6E29D99337b166b83fB24bA17b19764B49D",
            False,
            "2023-10-20T10:17:29.379858899Z",
        ),
        (
            "0xafA3E6E29D99337b166b83fB24bA17b19764B49D",
            True,
            "2023-10-20T10:17:13.691904982Z",
        ),
        (
            "0x0dd5AE26D3d2A742bC50010A486551B0F004147A",
            True,
            "2023-10-19T16:26:04.461192014Z",
        ),
        (
            "0x94C0e8Cf59e644fA76d4Fa83164B9F2030d07F31",
            True,
            "2023-10-19T15:18:12.136520754Z",
        ),
        (
            "0x936d69AbCD9acdC89455EEFAf744044fFC1CA660",
            False,
            "2023-10-19T15:02:03.537446313Z",
        ),
        (
            "0x936d69AbCD9acdC89455EEFAf744044fFC1CA660",
            True,
            "2023-10-19T14:59:22.072824857Z",
        ),
    ]

    return [
        PatronModeEvent(
            user_address=to_checksum_address(user),
            patron_mode_enabled=enabled,
            created_at=datetime.fromisoformat(time),
        )
        for (user, enabled, time) in events
    ]


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "patron_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_address", sa.String(length=42), nullable=False),
        sa.Column("patron_mode_enabled", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_column("patron_mode")

    # ### end Alembic commands ###

    # add events retreived from logs
    bind = op.get_bind()
    session = orm.Session(bind=bind)

    session.add_all(events())
    session.commit()


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(sa.Column("patron_mode", sa.BOOLEAN(), nullable=False))

    op.drop_table("patron_events")
    # ### end Alembic commands ###
