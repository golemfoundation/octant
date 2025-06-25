from typing import Annotated

from fastapi import Depends, Request
from pydantic import Field
from app.exceptions import XRealIpHeaderMissing
from v2.core.dependencies import OctantSettings


class XHeadersSettings(OctantSettings):
    x_real_ip_required: bool = Field(
        default=True,
        description="Whether to require the real IP address of the user.",
    )


def get_x_headers_settings() -> XHeadersSettings:
    return XHeadersSettings()


def get_x_real_ip(
    x_headers_settings: Annotated[XHeadersSettings, Depends(get_x_headers_settings)],
    request: Request,
) -> str:
    """
    Get the IP address from the request.
    """

    # Get the IP address from the request
    if x_headers_settings.x_real_ip_required:
        x_real_ip = request.headers.get("x-real-ip")
        if x_real_ip is None:
            raise XRealIpHeaderMissing()

        return x_real_ip

    if request.client is not None:
        return request.client.host
    return "127.0.0.1"


GetXRealIp = Annotated[str, Depends(get_x_real_ip)]
