from abc import ABC, abstractmethod
from typing import Optional

from app.context.manager import Context
from app.pydantic import Model


class Verifier(ABC, Model):
    @abstractmethod
    def _verify_logic(self, context: Context, **kwargs) -> Optional[bool]:
        ...

    @abstractmethod
    def _verify_signature(self, context: Context, **kwargs) -> Optional[bool]:
        ...

    def verify_logic(self, context: Context, **kwargs) -> bool:
        result = self._verify_logic(context, **kwargs)
        return result if result is not None else True

    def verify_signature(self, context: Context, **kwargs) -> bool:
        result = self._verify_signature(context, **kwargs)
        return result if result is not None else True

    def verify(self, context: Context, **kwargs) -> bool:
        return self.verify_logic(context, **kwargs) and self.verify_signature(
            context, **kwargs
        )
