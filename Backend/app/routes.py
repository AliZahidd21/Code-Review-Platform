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

def decode_token():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, "Authorization header missing or invalid"
    
    token = auth_header.split(" ")[1]  # Extract the token part
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload, None  # Return payload if valid
    except jwt.ExpiredSignatureError:
        return None, "Token has expired"
    except jwt.InvalidTokenError:
        return None, "Invalid token"


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

@app_routes.route('/api/questions', methods=['GET'])
def get_all_questions():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("USE questionanswerplatform")  # Select the database explicitly

        query = """
            SELECT 
                q.question_id,
                q.title,
                q.body,
                q.created_at,
                q.updated_at,
                q.views,
                q.upvotes,
                u.username AS asked_by
            FROM 
                questions q
            JOIN 
                users u ON q.user_id = u.user_id;
        """
        cursor.execute(query)
        results = cursor.fetchall()
        questions = [
            {
                "question_id": row[0],
                "title": row[1],
                "body": row[2],
                "created_at": row[3],
                "updated_at": row[4],
                "views": row[5],
                "upvotes": row[6],
                "asked_by": row[7]
            }
            for row in results
        ]
        return jsonify({"questions": questions}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app_routes.route('/api/questions/<int:question_id>', methods=['GET'])
def get_question_with_details(question_id):
    try:
        # Establish a database connection
        cursor = mysql.connection.cursor()
        cursor.execute("USE questionanswerplatform")  # Select the database explicitly

        # SQL query to fetch the question, answers, and comments
        query = """
        SELECT 
            q.question_id AS question_id,
            q.title AS question_title,
            q.body AS question_body,
            q.created_at AS question_created_at,
            q.updated_at AS question_updated_at,
            q.views AS question_views,
            q.upvotes AS question_upvotes,
            
            a.answer_id AS answer_id,
            a.body AS answer_body,
            a.code AS answer_code,
            a.created_at AS answer_created_at,
            a.updated_at AS answer_updated_at,
            a.upvotes AS answer_upvotes,
            
            c.comment_id AS comment_id,
            c.parent_type AS comment_parent_type,
            c.parent_id AS comment_parent_id,
            c.body AS comment_body,
            c.created_at AS comment_created_at,
            c.updated_at AS comment_updated_at
        FROM 
            questions q
        LEFT JOIN 
            answers a ON q.question_id = a.question_id
        LEFT JOIN 
            comments c ON (
                (c.parent_type = 'question' AND c.parent_id = q.question_id) OR
                (c.parent_type = 'answer' AND c.parent_id = a.answer_id)
            )
        WHERE 
            q.question_id = %s;
        """
        
        # Execute the query with the given question_id
        cursor.execute(query, (question_id,))
        result = cursor.fetchall()

        # If no results, return an error
        if not result:
            return jsonify({"error": "Question not found"}), 404

        # Organize the result into a structured format
        response = {
            "question": {
                "question_id": result[0][0],
                "title": result[0][1],
                "body": result[0][2],
                "created_at": result[0][3],
                "updated_at": result[0][4],
                "views": result[0][5],
                "upvotes": result[0][6],
            },
            "answers": [],
            "comments": [],
        }

        answers = {}  # To store answers by their ID
        comments = []  # To store comments

        # Process each row
        for row in result:
            # Answer information (if exists)
            if row[7]:  # Answer exists
                answer = {
                    "answer_id": row[7],
                    "body": row[8],
                    "code": row[9],
                    "created_at": row[10],
                    "updated_at": row[11],
                    "upvotes": row[12],
                    "comments": []
                }
                # Add answer to dictionary, indexed by answer_id
                answers[row[7]] = answer

            # Comment information (if exists)
            if row[13]:  # Comment exists
                comment = {
                    "comment_id": row[13],
                    "parent_type": row[14],
                    "parent_id": row[15],
                    "body": row[16],
                    "created_at": row[17],
                    "updated_at": row[18]
                }
                # Check if comment is related to an answer or question
                if row[14] == 'answer' and row[15] in answers:
                    answers[row[15]]["comments"].append(comment)
                else:
                    comments.append(comment)

        # Now append answers and comments to the response
        response["answers"] = list(answers.values())
        response["comments"] = comments

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app_routes.route('/api/users', methods=['GET'])
def get_user_info():
    # Get the token from the request header
    payload, error = decode_token()
    
    if error:
        return jsonify({"error": error}), 401  # Unauthorized if token is invalid

    user_id_from_token = payload['user_id']  # Assuming the token contains the user_id
    try:
        # Fetch user info from the database
        cursor = mysql.connection.cursor()
        cursor.execute("USE questionanswerplatform")
        
        # Query to fetch user information
        query = """
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.created_at
        FROM
            users u
        WHERE
            u.user_id = %s;
        """
        cursor.execute(query, (user_id_from_token,))
        result = cursor.fetchone()
        print(result)
        if not result:
            return jsonify({"error": "User not found"}), 404

        # Return user data as JSON
        user_info = {
            "user_id": result[0],
            "username": result[1],
            "email": result[2],
            "created_at": result[3]
        }
        print(user_info)
        print("Decoded user_id: {user_id_from_token}")  # Log the user_id


        return jsonify(user_info), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
