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

        query = """
        SELECT 
            q.question_id AS question_id,
            q.title AS question_title,
            q.body AS question_body,
            q.code AS question_code,
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
                "code": result[0][3],
                "created_at": result[0][4],
                "updated_at": result[0][5],
                "views": result[0][6],
                "upvotes": result[0][7],
            },
            "answers": [],
            "comments": [],
        }

        answers = {}  # To store answers by their ID
        comments = []  # To store comments

        # Process each row
        for row in result:
            # Answer information (if exists)
            if row[8]:  # Answer exists
                answer = {
                     "answer_id": row[8],
                    "body": row[9],
                    "code": row[10],
                    "created_at": row[11],
                    "updated_at": row[12],
                    "upvotes": row[13],
                    "comments": []  # This will
                }
                # Add answer to dictionary, indexed by answer_id
                answers[row[8]] = answer

            # Comment information (if exists)
            if row[14]:  # Comment exists
                comment = {
                    "comment_id": row[14],
                    "parent_type": row[15],
                    "parent_id": row[16],
                    "body": row[17],
                    "created_at": row[18],
                    "updated_at": row[19]
                }
                if row[15] == 'answer' and row[16] in answers:
                    answers[row[16]]["comments"].append(comment)
                elif row[15] == 'question':
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

@app_routes.route('/api/questions/<int:question_id>', methods=['DELETE'])
def delete_question(question_id):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("USE questionanswerplatform") 

        query = "DELETE FROM questions WHERE question_id = %s"
        
        cursor.execute(query, (question_id,))
        mysql.connection.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Question not found"}), 404
        
        cursor.close()
        return jsonify({"message": "Question deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app_routes.route('/api/tags', methods=['GET'])
def get_all_tags():
    try:
        cursor=mysql.connection.cursor()
        cursor.execute("USE questionanswerplatform") 
        query = "SELECT tag_id, tag_name FROM tags "
        cursor.execute(query)
        mysql.connection.commit()
        results = cursor.fetchall()

        cursor.close()
        if not results:
            return jsonify({"message": "No tags found"}), 404

        tags = [{"tag_id": row[0], "tag_name": row[1]} for row in results]

        return jsonify({"tags": tags}), 200

    except Exception as e:
            return jsonify({"error": str(e)}), 500

@app_routes.route('/api/questions', methods=['GET'])
def get_questions_by_tag():
    try:
        tag_name = request.args.get('tag')

        if not tag_name:
            return jsonify({"error": "Tag name is required"}), 400

        cursor = mysql.connection.cursor()
        cursor.execute("USE questionanswerplatform")  

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
            question_tags qt ON q.question_id = qt.question_id
        JOIN 
            tags t ON qt.tag_id = t.tag_id
        JOIN 
            users u ON q.user_id = u.user_id
        WHERE 
            t.tag_name = %s;
        """
        
        cursor.execute(query, (tag_name,))
        results = cursor.fetchall()

        cursor.close()

        if not results:
            return jsonify({"message": "No questions found for this tag"}), 404

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

@app_routes.route('/api/questions/<int:question_id>/comments', methods=['GET'])
def get_comments_for_question(question_id):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("USE questionanswerplatform") 
        query = """
        SELECT 
            c.comment_id,
            c.parent_type,
            c.parent_id,
            c.body,
            c.created_at,
            c.updated_at,
            u.username AS commented_by
        FROM 
            comments c
        JOIN
            users u ON c.user_id = u.user_id
        WHERE
            c.parent_type = 'question' AND c.parent_id = %s;
        """

        cursor.execute(query, (question_id,))
        result = cursor.fetchall()

        if not result:
            return jsonify({"message": "No comments found for this question"}), 404

        comments = [
            {
                "comment_id": row[0],
                "parent_type": row[1],
                "parent_id": row[2],
                "body": row[3],
                "created_at": row[4],
                "updated_at": row[5],
                "commented_by": row[6]
            }
            for row in result
        ]

        return jsonify({"comments": comments}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app_routes.route('/api/uploadquestion', methods=['POST'])
def upload_question():
    try:
        # Decode the token
        payload, error = decode_token()
        if error:
            return jsonify({"error": error}), 401

        user_id = payload.get("user_id")
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        # Parse request data
        data = request.json
        if not data:
            return jsonify({"error": "Missing request body"}), 400

        title = data.get("title")
        description = data.get("description")
        code_snippet = data.get("code")

        if not title or not description:
            return jsonify({"error": "Title and description are required"}), 400

        # Insert into the database
        cursor = mysql.connection.cursor()
        cursor.execute("USE questionanswerplatform")
        
        query = """
        INSERT INTO questions (user_id, title, body, code, created_at)
        VALUES (%s, %s, %s, %s, NOW())
        """
        cursor.execute(query, (user_id, title, description, code_snippet))

        # Log query for debugging        
        mysql.connection.commit()
        print("Commit successful")

        question_id = cursor.lastrowid
        cursor.close()

        return jsonify({"message": "Question submitted successfully", "question_id": question_id}), 201

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

@app_routes.route('/api/getuseridfromtoken', methods=['GET'])
def getuserid():
    try:
        # Decode the token
        payload, error = decode_token()
        if error:
            return jsonify({"error": error}), 401
        user_id = payload.get("user_id")
        return jsonify({'user_id': user_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app_routes.route('/api/updatequestion/<int:question_id>', methods=['PUT'])
def updatequestion(question_id):
    try:
        payload, error = decode_token()  # Decode token and extract payload
        user_id = payload['user_id']    # Extract user_id from the payload
        
        data = request.json
        if not data:
            return jsonify({"error": "Invalid or missing JSON data"}), 400

        code = data.get('code')
        body = data.get('body')

        # Ensure all required fields are provided
        if not all([code, body]):
            return jsonify({"error": "Missing required fields"}), 400

        cursor = mysql.connection.cursor()
        cursor.execute("USE questionanswerplatform")
        
        # Query to fetch user information
        query = """
        SELECT user_id
        FROM questions
        WHERE question_id = %s;
        """
        cursor.execute(query, (question_id,))
        result = cursor.fetchone()
        
        if not result or user_id != result[0]:
            return jsonify({"error": "Unauthorized user"}), 403
        
        # Update question
        update_query = """
        UPDATE questions
        SET
            code = %s,
            body = %s,
            updated_at = NOW()
        WHERE
            question_id = %s;
        """
        cursor.execute(update_query, (code, body, question_id))
        mysql.connection.commit()

        return jsonify({"message": "Question updated successfully"}), 200
    
    except Exception as e:
        # Log the error for debugging purposes
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    
    except Exception as e:
        # Log the error (recommended for debugging)
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app_routes.route('/api/updateanswer/<int:answer_id>', methods=['PUT'])
def updateanswer(answer_id):
    try:
        payload, error = decode_token()  # Decode token and extract payload
        user_id = payload['user_id']    # Extract user_id from the payload
        
        # Parse JSON request data
        data = request.json
        if not data:
            return jsonify({"error": "Invalid or missing JSON data"}), 400

        code = data.get('code')
        body = data.get('body')

        # Ensure the required field is provided
        if not body:
            return jsonify({"error": "Missing required fields"}), 400

        cursor = mysql.connection.cursor()
        cursor.execute("USE questionanswerplatform")
        
        # Query to verify the user is the owner of the answer
        query = """
        SELECT user_id
        FROM answers
        WHERE answer_id = %s;
        """
        cursor.execute(query, (answer_id,))
        result = cursor.fetchone()
        
        if not result or user_id != result[0]:
            return jsonify({"error": "Unauthorized user"}), 403
        
        # Update the answer
        update_query = """
        UPDATE answers
        SET
            code = %s,
            body = %s,
            updated_at = NOW()
        WHERE
            answer_id = %s;
        """
        cursor.execute(update_query, (code ,body, answer_id))
        mysql.connection.commit()

        return jsonify({"message": "Answer updated successfully"}), 200

    except Exception as e:
        # Log the error for debugging purposes
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app_routes.route('/api/updatecomment/<int:comment_id>', methods=['PUT'])
def updatecomment(comment_id):
    try:
        payload, error = decode_token()  # Decode token and extract payload
        user_id = payload['user_id']    # Extract user_id from the payload
        
        # Parse JSON request data
        data = request.json
        if not data:
            return jsonify({"error": "Invalid or missing JSON data"}), 400

        body = data.get('body')

        # Ensure the required field is provided
        if not body:
            return jsonify({"error": "Missing required fields"}), 400

        cursor = mysql.connection.cursor()
        cursor.execute("USE questionanswerplatform")
        
        # Query to verify the user is the owner of the comment
        query = """
        SELECT user_id
        FROM comments
        WHERE comment_id = %s;
        """
        cursor.execute(query, (comment_id,))
        result = cursor.fetchone()
        
        if not result or user_id != result[0]:
            return jsonify({"error": "Unauthorized user"}), 403
        
        # Update the comment
        update_query = """
        UPDATE comments
        SET
            body = %s,
            updated_at = NOW()
        WHERE
            comment_id = %s;
        """
        cursor.execute(update_query, (body, comment_id))
        mysql.connection.commit()

        return jsonify({"message": "Comment updated successfully"}), 200

    except Exception as e:
        # Log the error for debugging purposes
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
