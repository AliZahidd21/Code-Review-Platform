from app.extensions import mysql
from werkzeug.security import generate_password_hash
from datetime import datetime

def register_user(username, email, password_hash):
    """Registers a new user in the database."""
    cursor = mysql.connection.cursor()
    cursor.execute("USE questionanswerplatform") 

    
    created_at = datetime.utcnow().isoformat()

    query = """
        INSERT INTO users (username, email, password_hash, created_at)
        VALUES (%s, %s, %s, %s)
    """
    cursor.execute(query, (username, email, password_hash, created_at))
    mysql.connection.commit()
    user_id = cursor.lastrowid  
    cursor.close()
    
    return user_id

def get_user_by_email(email):
    """Fetches user details by email."""
    cursor = mysql.connection.cursor()
    cursor.execute("USE questionanswerplatform")  

    query = "SELECT user_id, username, email, password_hash FROM users WHERE email = %s"
    cursor.execute(query, (email,))
    user = cursor.fetchone()
    cursor.close()
    return user

def get_user_by_id(user_id):
    """Fetches user details by ID."""
    cursor = mysql.connection.cursor()
    cursor.execute("USE questionanswerplatform")  

    query = "SELECT user_id, username, email FROM users WHERE user_id = %s"
    cursor.execute(query, (user_id,))
    user = cursor.fetchone()
    cursor.close()
    return {"user_id": user[0], "username": user[1], "email": user[2]} if user else None

def get_top_questions():
    """Fetches the top questions based on views and upvotes."""
    cursor = mysql.connection.cursor()
    cursor.execute("USE questionanswerplatform") 

    query = """
    SELECT Q.question_id, Q.title, Q.body, Q.views, Q.upvotes, U.username AS author
    FROM questions Q
    JOIN users U ON Q.user_id = U.user_id
    ORDER BY Q.upvotes DESC, Q.views DESC
    LIMIT 10
    """
    cursor.execute(query)
    questions = cursor.fetchall()
    cursor.close()
    return [
        {"question_id": q[0], "title": q[1], "body": q[2], "views": q[3], "upvotes": q[4], "author": q[5]}
        for q in questions
    ]

