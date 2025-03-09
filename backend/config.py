import secrets
from datetime import timedelta

# Configuration de l'application
class Config:
    SECRET_KEY = secrets.token_hex(32)
    JWT_SECRET_KEY = secrets.token_hex(32)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=20)

    # Configuration de la base de données
    SQLALCHEMY_DATABASE_URI = "sqlite:///users.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Configuration de Flask-Mail
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = "no.reply.chefbot@gmail.com"
    MAIL_PASSWORD = "bcls sxoy komf oxpo"
