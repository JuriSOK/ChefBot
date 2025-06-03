import pytest
from flask import Flask
from werkzeug.security import check_password_hash
from main import db # type: ignore
from models import User, ResetToken, Conversation, AccountPersonnalisation, Favorite # type: ignore

# Configuration du test (fournit l'app et la DB)
@pytest.fixture
def test_app():
    # Création d'une nouvelle app Flask pour les tests
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # Base en mémoire
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test-secret-key'

    # Attache db à cette app de test
    db.init_app(app)

    with app.app_context():
        db.create_all()  # Crée les tables
        yield app  # Fournit l'app pour les tests
        db.drop_all()  # Nettoie après


@pytest.fixture
def test_db(test_app):
    # Fournit simplement db (attaché à test_app)
    return db


# Test du modèle `User`
def test_user_creation(test_db):
    # Créer un nouvel utilisateur
    user = User(
        username="test@example.com",
        first_name="Jean",
        last_name="Dupont"
    )
    user.set_password("motdepasse")

    # Ajouter et valider dans la session
    test_db.session.add(user)
    test_db.session.commit()

    # Vérifications
    assert user.id is not None
    assert user.username == "test@example.com"
    assert check_password_hash(user.password_hash, "motdepasse")


def test_user_update(test_db):
    # Créer un utilisateur
    user = User(
        username="test@example.com",
        first_name="Jean",
        last_name="Dupont"
    )
    user.set_password("motdepasse")
    test_db.session.add(user)
    test_db.session.commit()

    # Mise à jour du prénom
    user.set_first_name("Pierre")
    test_db.session.commit()

    # Vérifier que le prénom a été mis à jour
    assert user.first_name == "Pierre"


# Test du modèle `ResetToken`
def test_reset_token_creation(test_db):
    # Créer un utilisateur
    user = User(
        username="test@example.com",
        first_name="Jean",
        last_name="Dupont"
    )
    user.set_password("motdepasse")
    test_db.session.add(user)
    test_db.session.commit()

    # Créer un token de réinitialisation de mot de passe
    token = ResetToken(
        user_id=user.id,
        token="reset_token_123",
        used=False
    )
    test_db.session.add(token)
    test_db.session.commit()

    # Vérifications
    assert token.id is not None
    assert token.token == "reset_token_123"
    assert token.used is False


def test_reset_token_expiration(test_db):
    # Créer un utilisateur
    user = User(
        username="test@example.com",
        first_name="Jean",
        last_name="Dupont"
    )
    user.set_password("motdepasse")
    test_db.session.add(user)
    test_db.session.commit()

    # Créer un token
    token = ResetToken(
        user_id=user.id,
        token="reset_token_123",
        used=False
    )
    test_db.session.add(token)
    test_db.session.commit()

    # Marquer le token comme utilisé
    token.use_it()
    test_db.session.commit()

    # Vérifier que le token est marqué comme expiré
    assert token.is_expired() is True


# Test du modèle `Conversation`
def test_conversation_creation(test_db):
    # Créer un utilisateur
    user = User(
        username="test@example.com",
        first_name="Jean",
        last_name="Dupont"
    )
    user.set_password("motdepasse")
    test_db.session.add(user)
    test_db.session.commit()

    # Créer une conversation
    conversation = Conversation(
        user_id=user.id,
        title="Ma première conversation",
        messages="[{\"role\": \"system\", \"content\": \"Bonjour!\"}]"
    )
    test_db.session.add(conversation)
    test_db.session.commit()

    # Vérifications
    assert conversation.id is not None
    assert conversation.title == "Ma première conversation"
    assert conversation.messages == "[{\"role\": \"system\", \"content\": \"Bonjour!\"}]"
    assert conversation.user_id == user.id


# Test du modèle `AccountPersonnalisation`
def test_account_personnalisation_creation(test_db):
    # Créer un utilisateur
    user = User(
        username="test@example.com",
        first_name="Jean",
        last_name="Dupont"
    )
    user.set_password("motdepasse")
    test_db.session.add(user)
    test_db.session.commit()

    # Créer la personnalisation
    personnalisation = AccountPersonnalisation(
        user_id=user.id,
        allergies="[]",
        banned_ingredients="['gluten']",
        diet="Végétarien",
        food_goal="Maintien du poids",
        kitchen_equipment="Poêle"
    )
    test_db.session.add(personnalisation)
    test_db.session.commit()

    # Vérifications
    assert personnalisation.id is not None
    assert personnalisation.diet == "Végétarien"
    assert personnalisation.food_goal == "Maintien du poids"
    assert personnalisation.kitchen_equipment == "Poêle"
    assert personnalisation.user_id == user.id


# Test du modèle `Favorite`
def test_favorite_creation(test_db):
    # Créer un utilisateur
    user = User(
        username="test@example.com",
        first_name="Jean",
        last_name="Dupont"
    )
    user.set_password("motdepasse")
    test_db.session.add(user)
    test_db.session.commit()

    # Créer un favori
    favorite = Favorite(
        user_id=user.id,
        type="Recette pertinente",
        title="Pizza Margherita",
        content="Recette simple de pizza."
    )
    test_db.session.add(favorite)
    test_db.session.commit()

    # Vérifications
    assert favorite.id is not None
    assert favorite.type == "Recette pertinente"
    assert favorite.title == "Pizza Margherita"
    assert favorite.content == "Recette simple de pizza."
    assert favorite.user_id == user.id
