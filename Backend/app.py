from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from app.routes import app_routes  
from app.extensions import mysql  

app = Flask(__name__)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'MYSQLPASSWORD'
app.config['MYSQL_DATABASE'] = 'questionanswerplatform'

mysql.init_app(app)

api = Api(app)

CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

app.register_blueprint(app_routes)

if __name__ == "__main__":
    app.run(debug=True)
