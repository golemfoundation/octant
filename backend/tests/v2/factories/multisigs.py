import random
from datetime import datetime

from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory
from factory import Sequence, LazyAttribute
from sqlalchemy import select

from app.infrastructure.database.models import MultisigSignatures
from app.modules.dto import SignatureOpType
from app.infrastructure.database.multisig_signature import SigStatus
from tests.v2.factories.base import FactorySetBase
from tests.v2.factories.helpers import generate_random_eip55_address


class MultisigSignatureFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = MultisigSignatures
        sqlalchemy_session_persistence = "commit"

    address = LazyAttribute(lambda _: generate_random_eip55_address())
    type = SignatureOpType.ALLOCATION
    message = LazyAttribute(lambda _: f"Test message {random.randint(1, 1000)}")
    msg_hash = LazyAttribute(lambda _: f"0x{random.getrandbits(256).to_bytes(32, 'big').hex()}")
    safe_msg_hash = LazyAttribute(lambda _: f"0x{random.getrandbits(256).to_bytes(32, 'big').hex()}")
    status = SigStatus.PENDING
    user_ip = "127.0.0.1"
    confirmed_signature = None


class MultisigSignatureFactorySet(FactorySetBase):
    _factories = {"multisig_signature": MultisigSignatureFactory}

    async def create(
        self,
        address: str | None = None,
        op_type: SignatureOpType | None = None,
        message: str | None = None,
        status: SigStatus | None = None,
        user_ip: str | None = None,
        confirmed_signature: str | None = None,
    ) -> MultisigSignatures:
        factory_kwargs = {}

        if address is not None:
            factory_kwargs["address"] = address
        if op_type is not None:
            factory_kwargs["type"] = op_type
        if message is not None:
            factory_kwargs["message"] = message
        if status is not None:
            factory_kwargs["status"] = status
        if user_ip is not None:
            factory_kwargs["user_ip"] = user_ip
        if confirmed_signature is not None:
            factory_kwargs["confirmed_signature"] = confirmed_signature

        signature = await MultisigSignatureFactory.create(**factory_kwargs)
        return signature

    async def get_by_address_and_type(
        self, address: str, op_type: SignatureOpType
    ) -> list[MultisigSignatures]:
        results = await self.session.scalars(
            select(MultisigSignatures).where(
                MultisigSignatures.address == address,
                MultisigSignatures.type == op_type
            )
        )
        return list(results)
