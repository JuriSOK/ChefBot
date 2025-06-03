# Importation des modules nécessaires
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from dotenv import load_dotenv
import openai
import os

# Importation de la configuration
from src.config import Config

# Initialisation des extensions Flask (sans lier à l'app tout de suite)
db = SQLAlchemy(session_options={"autocommit": False, "autoflush": False})  
# Initialisation de l'instance SQLAlchemy avec les options :
# - autocommit=False : Les transactions ne sont pas automatiquement validées.
# - autoflush=False : Les modifications ne sont pas automatiquement poussées dans la base avant les requêtes.

jwt = JWTManager()  # Gestion des JWT (JSON Web Tokens) pour l'authentification
mail = Mail()  # Initialisation de Flask-Mail pour l'envoi d'emails

# Initialisation de l'application Flask
app = Flask(__name__)  # Création de l'application Flask
app.config.from_object(Config)  # Chargement de la configuration depuis le fichier Config

# Initialisation des extensions Flask avec l'application
CORS(app)  # Permet la gestion des requêtes CORS (Cross-Origin Resource Sharing)
db.init_app(app)  # Attache l'instance SQLAlchemy à l'application
jwt.init_app(app)  # Attache JWT à l'application
mail.init_app(app)  # Attache Flask-Mail à l'application

# Chargement des variables d'environnement depuis le fichier .env
load_dotenv()  # Charge les variables d'environnement définies dans le fichier .env

# Initialisation du client OpenAI avec la clé API
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))  
# La clé API est récupérée depuis les variables d'environnement pour sécuriser l'accès.

# Importation des routes et du chatbot (après que les extensions soient initialisées)
from src.routes import *  # Importation des routes définies dans le fichier routes.py
from src.chatbot import *  # Importation des fonctionnalités du chatbot définies dans chatbot.py

# Lancement de l'application Flask
if __name__ == "__main__":
    with app.app_context():
        db.create_all()  
        # Création des tables de la base de données si elles n'existent pas déjà.
        # Cette étape garantit que la base est prête avant le démarrage du serveur.

    app.run(debug=True, host='0.0.0.0', port=5001)  
    # Démarrage du serveur Flask avec :
    # - debug=True : Active le mode débogage pour afficher les erreurs en détail.
    # - host='0.0.0.0' : Permet d'écouter sur toutes les adresses IP.
    # - port=5001 : Définit le port sur lequel le serveur écoute.
