import json
import os
from datetime import datetime
from typing import Dict
from alembic import op
from sqlalchemy import text


def _load_json_data(filepath: str) -> Dict:
    with open(filepath, "r") as file:
        data = json.load(file)
    return data[0]


def _get_json_path(filename: str) -> str:
    json_filename = os.path.join(os.path.dirname(__file__), "files", filename)
    return json_filename


def _prepare_project_upsert_query(project: dict, epoch: int):
    current_time = datetime.utcnow()

    return text(
        """
        INSERT INTO project_details (name, address, created_at, epoch)
        VALUES (:name, :address, :created_at, :epoch)
        ON CONFLICT (address, epoch)
        DO UPDATE SET
            name = EXCLUDED.name,
            created_at = :created_at
    """
    ).bindparams(
        name=project["name"],
        address=project["address"],
        created_at=current_time,
        epoch=epoch,
    )


def _prepare_delete_project_query(project: dict, epoch: int):
    return text(
        """
        DELETE FROM project_details
        WHERE address = :address AND epoch = :epoch
    """
    ).bindparams(address=project["address"], epoch=epoch)


def upgrade(filename: str, epoch: int):
    json_filepath = _get_json_path(filename)
    project_data = _load_json_data(json_filepath)

    for project in project_data:
        query = _prepare_project_upsert_query(project, epoch)
        op.execute(query)


def downgrade(filename: str, epoch: int):
    json_filepath = _get_json_path(filename)
    project_data = _load_json_data(json_filepath)

    for project in project_data:
        query = _prepare_delete_project_query(project, epoch)
        op.execute(query)
