from abc import ABC, abstractmethod

from app.context.manager import Context


def verifier_wrapper(verify_func):
    def wrapper(self, context: Context, **kwargs) -> bool:
        result = verify_func(self, context, **kwargs)
        return result if result is not None else True

    return wrapper


class Verifier(ABC):
    @abstractmethod
    @verifier_wrapper
    def verify_logic(self, context: Context, **kwargs) -> bool:
        ...

    @abstractmethod
    @verifier_wrapper
    def verify_signature(self, context: Context, **kwargs) -> bool:
        ...

    def verify(self, context: Context, **kwargs) -> bool:
        return self.verify_logic(context, **kwargs) and self.verify_signature(
            context, **kwargs
        )
