from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from dotenv import load_dotenv
import openai
import os

# Importation de la configuration
from config import Config

# Initialisation de l'application Flask
app = Flask(__name__)
app.config.from_object(Config)

# Initialisation des extensions
CORS(app)
db = SQLAlchemy(app)
jwt = JWTManager(app)
mail = Mail(app)

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

from routes import *
from chatbot import *

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5001)
