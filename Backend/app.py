'''from flask import Flask, request, jsonify, redirect, url_for, render_template
from flask_restful import Api, Resource, reqparse
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import mysql
from flask_cors import CORS  # Import CORS for handling cross-origin requests
from app.models import register_user, get_user_by_email, get_top_questions, get_user_by_id

app = Flask(__name__)

# Apply CORS to allow your frontend to make requests to this Flask backend
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Register the blueprint that contains your routes
app.register_blueprint(app_routes)

# MySQL configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'  
app.config['MYSQL_PASSWORD'] = '1234'
app.config['MYSQL_DATABASE'] = 'questionanswerplatform'

# Initialize MySQL connection
mysql.init_app(app)

# Initialize API
api = Api(app)

# Request parsers
user_args = reqparse.RequestParser()
user_args.add_argument("username", type=str, required=False, help="Username is required")
user_args.add_argument("email", type=str, required=True, help="Email is required")
user_args.add_argument("password", type=str, required=True, help="Password is required")
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        # Validate user (check against DB or mock user data)
        user = get_user_by_email(email)
        if user and check_password_hash(user[3], password):
            # Redirect to a user profile or dashboard
            return redirect(url_for("user", user_id=user[0]))
        else:
            # Invalid credentials, re-render the login page with an error message
            return render_template("login.html", error="Invalid credentials")
    return render_template("login.html")  # Display logi


# Resource: Register User
class RegisterUser(Resource):
    def post(self):
        args = user_args.parse_args()
        username = args.get("username")
        email = args["email"]
        password = args["password"]

        # Check if user exists
        existing_user = get_user_by_email(email)
        if existing_user:
            return {"error": "User with this email already exists"}, 400

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Register the user
        user_id = register_user(username, email, hashed_password)

        return {"message": "User registered", "user_id": user_id, "username": username}, 201

# Resource: Login User
class LoginUser(Resource):
    def post(self):
        args = user_args.parse_args()
        email = args["email"]
        password = args["password"]

        # Validate user
        user = get_user_by_email(email)
        if user and check_password_hash(user[3], password):
            return {
                "message": "Login successful",
                "user": {"user_id": user[0], "username": user[1], "email": user[2]},
            }, 200
        return {"error": "Invalid credentials"}, 401
# Resource: Get Top Questions
class TopQuestions(Resource):
    def get(self):
        questions = get_top_questions()
        return {"questions": questions}, 200

# Resource: Get User by ID
class UserByID(Resource):
    def get(self, user_id):
        user = get_user_by_id(user_id)
        if user:
            return {"user": user}, 200
        return {"error": "User not found"}, 404

# Test Database Connection
@app.route('/test-db', methods=['GET'])
def test_db():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT DATABASE();")
        db_name = cursor.fetchone()
        cursor.close()
        return jsonify({"db_name": db_name[0] if db_name else "NULL"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Register API Resources
api.add_resource(RegisterUser, "/api/users/register")
api.add_resource(LoginUser, "/api/users/login")
api.add_resource(TopQuestions, "/api/top-questions")
api.add_resource(UserByID, "/api/user/<int:user_id>")

if __name__ == "__main__":
    app.run(debug=True)
'''
from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from app.routes import app_routes  # Import routes from the 'app' folder
from app.extensions import mysql  # Import MySQL connection setup from 'extensions'

app = Flask(__name__)

# MySQL configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '1234'
app.config['MYSQL_DATABASE'] = 'questionanswerplatform'

# Initialize MySQL connection
mysql.init_app(app)

# Initialize API
api = Api(app)

# Apply CORS to allow your frontend to make requests to this Flask backend
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Register the blueprint for your routes
app.register_blueprint(app_routes)

if __name__ == "__main__":
    app.run(debug=True)
