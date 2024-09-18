import json
import os
from datetime import datetime
from typing import Dict


def load_json_data(filepath: str) -> Dict:
    """Load data from a JSON file."""
    with open(filepath, "r") as file:
        data = json.load(file)
    return data[0]


def get_json_path(filename: str) -> str:
    json_filename = os.path.join(os.path.dirname(__file__), "files", filename)
    return json_filename


def prepare_project_upsert_query(project: dict) -> str:
    current_time = datetime.utcnow()

    return f"""
        INSERT INTO project_details (name, address, created_at)
        VALUES ('{project["name"]}', '{project["address"]}', '{current_time}')
        ON CONFLICT (address)
        DO UPDATE SET
            name = EXCLUDED.name,
            created_at = '{current_time}';
    """


def prepare_delete_project_query(project: dict) -> str:
    return f"""
        DELETE FROM project_details WHERE address = '{project["address"]}'
    """
