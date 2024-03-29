from eth_account.messages import encode_defunct

from app.infrastructure import database
from app.infrastructure.database.multisig_signature import SigStatus
from app.modules.dto import SignatureOpType
from app.modules.user.tos.core import build_consent_message
from app.infrastructure.database.models import MultisigSignatures


def build_user_signature(user, user_address=None):
    if user_address is None:
        user_address = user.address

    msg = build_consent_message(user_address)
    message = encode_defunct(text=msg)
    signature_bytes = user.sign_message(message).signature

    return signature_bytes


def create_multisig_signature(
    address: str,
    msg: str,
    msg_hash: str,
    op_type: SignatureOpType,
    status: SigStatus = SigStatus.PENDING,
):
    database.multisig_signature.save_signature(address, op_type, msg, msg_hash, status)


def get_signature_by_id(id: int) -> MultisigSignatures:
    return MultisigSignatures.query.get(id=id)
