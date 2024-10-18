from app.exceptions import OctantException


class AllocationWindowClosed(OctantException):
    code = 403  # Forbidden
    description = "This action is available only during the allocation window."

    def __init__(self):
        super().__init__(self.description, self.code)
