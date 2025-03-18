from flask import current_app
from flask.testing import FlaskClient


class CustomFlaskClient(FlaskClient):
    """Custom client to log all GET, POST, and PUT requests."""

    def log_request(self, method: str, url: str, response):
        """Logs request details for GET, POST, and PUT methods."""
        current_app.logger.debug(
            f"Request {method} {url} [{response.status_code}] returned text {response.text}"
        )

    def get(self, *args, **kwargs):
        """Override get method to include logging."""
        response = super().get(*args, **kwargs)  # Call the original method
        self.log_request("GET", args[0] if args else "UNKNOWN", response)
        return response

    def post(self, *args, **kwargs):
        """Override post method to include logging."""
        response = super().post(*args, **kwargs)  # Call the original method
        self.log_request("POST", args[0] if args else "UNKNOWN", response)
        return response

    def put(self, *args, **kwargs):
        """Override put method to include logging."""
        response = super().put(*args, **kwargs)  # Call the original method
        self.log_request("PUT", args[0] if args else "UNKNOWN", response)
        return response

    def patch(self, *args, **kwargs):
        """Override patch method to include logging."""
        response = super().patch(*args, **kwargs)  # Call the original method
        self.log_request("PATCH", args[0] if args else "UNKNOWN", response)
        return response
