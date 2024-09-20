import json
import os
from datetime import datetime
from typing import Dict
from alembic import op


def _load_json_data(filepath: str) -> Dict:
    with open(filepath, "r") as file:
        data = json.load(file)
    return data[0]


def _get_json_path(filename: str) -> str:
    json_filename = os.path.join(os.path.dirname(__file__), "files", filename)
    return json_filename


def _prepare_project_upsert_query(project: dict, epoch: int) -> str:
    current_time = datetime.utcnow()

    return f"""
        INSERT INTO project_details (name, address, created_at, epoch)
        VALUES ('{project["name"]}', '{project["address"]}', '{current_time}', {epoch})
        ON CONFLICT (address, epoch)
        DO UPDATE SET
            name = EXCLUDED.name,
            created_at = '{current_time}';
    """


def _prepare_delete_project_query(project: dict, epoch: int) -> str:
    return f"""
        DELETE FROM project_details WHERE address = '{project["address"]}' AND epoch = {epoch}
    """


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
