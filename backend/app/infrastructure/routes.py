from flask import jsonify, Blueprint, current_app

from app.core import history

main_bp = Blueprint('routes', __name__)


@main_bp.route('/history/<string:user_address>', methods=['GET'])
def get_history(user_address):
    current_app.logger.info(f"Getting history for user: {user_address}")
    user_history = history.get_history(user_address)
    return jsonify(user_history)
