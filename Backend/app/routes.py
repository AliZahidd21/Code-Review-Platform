from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import register_user, get_user_by_email, get_user_by_id, get_top_questions

# Create a Blueprint
app_routes = Blueprint('app_routes', __name__)

# Route: Register a new user
@app_routes.route('/api/users/register', methods=['POST','GET'])
def register():
    try:
        data = request.json  # Ensure Content-Type is application/json
        if not data:
            return jsonify({"error": "Invalid or missing JSON data"}), 400

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not all([username, email, password]):
            return jsonify({"error": "Missing required fields"}), 400

        # Check if user already exists
        existing_user = get_user_by_email(email)
        if existing_user:
            return jsonify({"error": "User with this email already exists"}), 400

        # Hash password and register user
        hashed_password = generate_password_hash(password)
        user_id = register_user(username, email, hashed_password)

        return jsonify({"message": "User registered", "user_id": user_id, "username": username}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route: Login a user
@app_routes.route('/api/users/login', methods=['POST','GET'])
def login():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid or missing JSON data"}), 400

        email = data.get('email')
        password = data.get('password')

        if not all([email, password]):
            return jsonify({"error": "Missing required fields"}), 400

        # Validate user credentials
        user = get_user_by_email(email)
        if user and check_password_hash(user[3], password):
            return jsonify({
                "message": "Login successful",
                "user": {"user_id": user[0], "username": user[1], "email": user[2]}
            }), 200
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route: Get top questions
@app_routes.route('/api/top-questions', methods=['GET'])
def get_top_questions_route():
    try:
        questions = get_top_questions()
        return jsonify({"questions": questions}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route: Get a user by ID
@app_routes.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = get_user_by_id(user_id)
        if user:
            return jsonify({"user": user}), 200
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
