import os
import secrets
from datetime import timedelta

# Définition des chemins de base pour le projet
# BASE_DIR représente le chemin absolu du répertoire contenant ce fichier (backend/src/)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
# INSTANCE_DIR représente le chemin absolu vers le dossier "instance" (backend/instance)
INSTANCE_DIR = os.path.join(BASE_DIR, "../instance")

# Classe de configuration principale pour l'application Flask
class Config:
    """
    Classe contenant les configurations principales de l'application Flask.

    Attributs :
    - SECRET_KEY (str) : Clé secrète utilisée pour sécuriser les sessions Flask et d'autres fonctionnalités.
    - JWT_SECRET_KEY (str) : Clé secrète utilisée pour signer les tokens JWT.
    - JWT_ACCESS_TOKEN_EXPIRES (timedelta) : Durée de validité des tokens JWT.
    - SQLALCHEMY_DATABASE_URI (str) : URI de connexion à la base de données.
    - SQLALCHEMY_TRACK_MODIFICATIONS (bool) : Désactive le suivi des modifications pour économiser des ressources.
    - MAIL_SERVER (str) : Serveur SMTP utilisé pour l'envoi d'emails.
    - MAIL_PORT (int) : Port utilisé pour les connexions sécurisées avec TLS.
    - MAIL_USE_TLS (bool) : Active TLS pour sécuriser la connexion.
    - MAIL_USERNAME (str) : Adresse email utilisée pour envoyer les emails.
    - MAIL_PASSWORD (str) : Mot de passe de l'adresse email.
    """

    # Clé secrète utilisée pour sécuriser les sessions Flask et d'autres fonctionnalités
    # Générée dynamiquement à chaque exécution
    SECRET_KEY = secrets.token_hex(32)

    # Clé secrète utilisée pour signer les tokens JWT
    # Générée dynamiquement à chaque exécution
    JWT_SECRET_KEY = secrets.token_hex(32)

    # Durée de validité des tokens JWT (20 minutes)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=20)

    # Configuration de la base de données
    # Utilisation de SQLite avec un fichier de base de données situé dans le dossier "instance"
    SQLALCHEMY_DATABASE_URI = f"postgresql://chefbot_db_user:354Eb9haTCrehZVu3DyXpOq986625xve@dpg-d06m5tc9c44c73fm1sng-a/chefbot_db"
    # Désactiver le suivi des modifications pour économiser des ressources
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Configuration pour l'envoi d'emails avec Flask-Mail
    MAIL_SERVER = "smtp.gmail.com"  # Serveur SMTP de Gmail
    MAIL_PORT = 587  # Port utilisé pour les connexions sécurisées avec TLS
    MAIL_USE_TLS = True  # Activer TLS pour sécuriser la connexion
    MAIL_USERNAME = "no.reply.chefbot@gmail.com"  # Adresse email utilisée pour envoyer les emails
    MAIL_PASSWORD = "bcls sxoy komf oxpo"  # Mot de passe de l'adresse email (à sécuriser dans un environnement réel)
