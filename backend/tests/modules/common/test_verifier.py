import pytest

from app.modules.common.verifier import Verifier


@pytest.mark.parametrize(
    "verify_logic, verify_signature, expected_result",
    [
        (True, True, True),
        (True, False, False),
        (False, True, False),
        (False, False, False),
        (None, None, True),
        (None, True, True),
        (True, None, True),
        (None, False, False),
        (False, None, False),
    ],
)
def test_verifier(verify_logic, verify_signature, expected_result):
    class MockVerifier(Verifier):
        def _verify_logic(self, context, **kwargs):
            return verify_logic

        def _verify_signature(self, context, **kwargs):
            return verify_signature

    verifier = MockVerifier()

    result = verifier.verify(None)

    assert result == expected_result


def test_verifier_raises_exception_in_logic():
    class MockVerifier(Verifier):
        def _verify_logic(self, context, **kwargs):
            raise Exception("logic")

        def _verify_signature(self, context, **kwargs):
            return True

    verifier = MockVerifier()

    with pytest.raises(Exception) as exc_info:
        verifier.verify(None)
    assert str(exc_info.value) == "logic"


def test_verifier_raises_exception_in_signature():
    class MockVerifier(Verifier):
        def _verify_logic(self, context, **kwargs):
            return True

        def _verify_signature(self, context, **kwargs):
            raise Exception("signature")

    verifier = MockVerifier()

    with pytest.raises(Exception) as exc_info:
        verifier.verify(None)
    assert str(exc_info.value) == "signature"
