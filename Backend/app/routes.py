import jwt
import datetime
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from app.extensions import mysql
from app.models import get_user_by_email, register_user

app_routes = Blueprint('app_routes', __name__)

# Secret key for JWT encoding/decoding (store this securely)
SECRET_KEY = "your_secret_key_here"  # Change this to a more secure key

# Function to generate a JWT token
def generate_jwt_token(user_id):
    expiration_time = datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour
    payload = {
        'user_id': user_id,
        'exp': expiration_time
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

# Route: Login a user
@app_routes.route('/api/users/login', methods=['POST'])
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
        if user and check_password_hash(user[3], password):  # user[3] is the password in your DB
            # Generate a JWT token
            token = generate_jwt_token(user[0])  # user[0] is the user_id in your DB

            return jsonify({
                "message": "Login successful",
                "user": {
                    "user_id": user[0],
                    "username": user[1],
                    "email": user[2]
                },
                "token": token  # Send the token in the response
            }), 200

        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route: Register a new user
@app_routes.route('/api/users/register', methods=['POST'])
def registeruser():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid or missing JSON data"}), 400

        # Extract data from request
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        # Ensure all required fields are provided
        if not all([username, email, password]):
            return jsonify({"error": "Missing required fields"}), 400

        # Check if email is already in use
        existing_user = get_user_by_email(email)
        if existing_user:
            return jsonify({"error": "Email already in use"}), 400

        # Hash the password before storing it
        password_hash = generate_password_hash(password)

        # Register the user and get the user_id
        user_id = register_user(username, email, password_hash)

        # You can optionally set a created_at date here or in the database if needed
        created_at = datetime.datetime.utcnow().isoformat()

        return jsonify({
            "message": "User registered successfully",
            "user_id": user_id,
            "username": username,
            "email": email,
            "created_at": created_at
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
