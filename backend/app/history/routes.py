from flask import jsonify, Blueprint, current_app

from app.history import service

blueprint = Blueprint('history', __name__)


@blueprint.route('/history/<string:user_address>', methods=['GET'])
def get_history(user_address):
    current_app.logger.info(f"Getting history for user: {user_address}")
    history = service.get_history(user_address)
    return jsonify(history)
