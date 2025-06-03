# Importation des modules nécessaires
from src.main import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
from itsdangerous import URLSafeTimedSerializer as Serializer
from src.main import app
from sqlalchemy import Enum

# Modèle représentant un utilisateur
class User(db.Model):
    """
    Classe pour représenter un utilisateur dans la base de données.

    Attributs :
    - id (int) : Identifiant unique de l'utilisateur.
    - username (str) : Adresse e-mail de l'utilisateur (unique).
    - first_name (str) : Prénom de l'utilisateur.
    - last_name (str) : Nom de famille de l'utilisateur.
    - password_hash (str) : Hash du mot de passe de l'utilisateur.
    - is_verified (bool) : Indique si l'utilisateur a vérifié son adresse e-mail.
    """
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    first_name = db.Column(db.String(30), nullable=False)
    last_name = db.Column(db.String(30), nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)

    def set_first_name(self, new_first_name):
        """
        Met à jour le prénom de l'utilisateur.
        Arguments :
        - new_first_name (str) : Nouveau prénom.
        """
        self.first_name = new_first_name

    def set_last_name(self, new_last_name):
        """
        Met à jour le nom de famille de l'utilisateur.
        Arguments :
        - new_last_name (str) : Nouveau nom de famille.
        """
        self.last_name = new_last_name
        
    def set_password(self, password):
        """
        Hash et met à jour le mot de passe de l'utilisateur.
        Arguments :
        - password (str) : Nouveau mot de passe.
        """
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """
        Vérifie si le mot de passe fourni correspond au hash stocké.
        Arguments :
        - password (str) : Mot de passe à vérifier.
        Retourne :
        - bool : True si le mot de passe est correct, False sinon.
        """
        return check_password_hash(self.password_hash, password)
    
    def get_token(self, expires_sec, SALT):
        """
        Génère un token sécurisé pour l'utilisateur.
        Arguments :
        - expires_sec (int) : Durée de validité du token en secondes.
        - SALT (str) : Sel utilisé pour sécuriser le token.
        Retourne :
        - str : Token sécurisé.
        """
        serial = Serializer(app.config['SECRET_KEY'])
        return serial.dumps({'user_id': self.id}, salt=SALT)
    
    @staticmethod
    def verify_token(token, expires_sec, SALT):
        """
        Vérifie et décode un token sécurisé.
        Arguments :
        - token (str) : Token à vérifier.
        - expires_sec (int) : Durée de validité maximale du token.
        - SALT (str) : Sel utilisé pour sécuriser le token.
        Retourne :
        - int : ID de l'utilisateur si le token est valide, None sinon.
        """
        serial = Serializer(app.config['SECRET_KEY'])
        try:
            user_id = serial.loads(token, salt=SALT, max_age=expires_sec)['user_id']
        except:
            return None
        return user_id

# Modèle représentant un token de réinitialisation de mot de passe
class ResetToken(db.Model):
    """
    Classe pour représenter un token de réinitialisation de mot de passe.

    Attributs :
    - id (int) : Identifiant unique du token.
    - user_id (int) : Identifiant de l'utilisateur associé.
    - token (str) : Valeur du token.
    - used (bool) : Indique si le token a été utilisé.
    """
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(64), unique=True, nullable=False)
    used = db.Column(db.Boolean, default=False)  # Indique si le token a été utilisé

    def is_expired(self):
        """
        Vérifie si le token a déjà été utilisé.
        Retourne :
        - bool : True si le token est expiré, False sinon.
        """
        return self.used
    
    def use_it(self):
        """
        Marque le token comme utilisé.
        """
        self.used = True

# Modèle représentant une conversation
class Conversation(db.Model):
    """
    Classe pour représenter une conversation entre un utilisateur et le chatbot.

    Attributs :
    - id (int) : Identifiant unique de la conversation.
    - user_id (int) : Identifiant de l'utilisateur associé.
    - title (str) : Titre de la conversation.
    - messages (str) : Messages échangés dans la conversation (format JSON).
    - created_at (datetime) : Date et heure de création de la conversation.
    """
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    messages = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('conversations', lazy=True))

# Modèle représentant la personnalisation du profil utilisateur
class AccountPersonnalisation(db.Model):
    """
    Classe pour représenter les préférences de personnalisation d'un utilisateur.

    Attributs :
    - id (int) : Identifiant unique de la personnalisation.
    - user_id (int) : Identifiant de l'utilisateur associé.
    - allergies (str) : Liste des allergies (format JSON).
    - banned_ingredients (str) : Liste des ingrédients bannis (format JSON).
    - diet (Enum) : Régime alimentaire de l'utilisateur.
    - food_goal (Enum) : Objectif alimentaire de l'utilisateur.
    - kitchen_equipment (str) : Équipements de cuisine disponibles (format JSON).
    """
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    allergies = db.Column(db.String(200), default="")
    banned_ingredients = db.Column(db.String(80), default="")
    diet = db.Column(Enum('Aucun régime', 'Végétarien', 'Végan', 'Sans gluten', 'Halal', 'Casher', 'Keto', 'Paléo', 'Méditerranéen'), default="Aucun régime")
    food_goal = db.Column(Enum('Aucun objectif', 'Perte de poids', 'Prise de muscle', 'Maintien du poids', 'Amélioration de la digestion', 'Santé cardiaque', 'Énergie et performance'), default="Aucun objectif")
    kitchen_equipment = db.Column(db.String(100), default="[\"Plaque de cuisson\", \"Poêle / Sauteuse\", \"Casserole / Cocotte\"]")

    user = db.relationship('User', backref=db.backref('personnalisations', lazy=True))

# Modèle représentant un favori
class Favorite(db.Model):
    """
    Classe pour représenter un favori enregistré par un utilisateur.

    Attributs :
    - id (int) : Identifiant unique du favori.
    - user_id (int) : Identifiant de l'utilisateur associé.
    - type (Enum) : Type de favori (Recette ou Astuce de cuisine).
    - title (str) : Titre du favori.
    - content (str) : Contenu du favori.
    """
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(Enum("Recette pertinente", "Astuce de cuisine"), nullable=False)
    title = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text, nullable=False)
    
    user = db.relationship('User', backref=db.backref('favorites', lazy=True))
