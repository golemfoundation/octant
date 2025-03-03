from typing import Annotated

from fastapi import Depends
from pydantic import Field
from v2.core.dependencies import OctantSettings


class XHeadersSettings(OctantSettings):
    x_real_ip_required: bool = Field(
        default=True,
        description="Whether to require the real IP address of the user.",
    )


def get_x_headers_settings() -> XHeadersSettings:
    return XHeadersSettings()


GetXHeadersSettings = Annotated[XHeadersSettings, Depends(get_x_headers_settings)]
