import pytest
import json
from flask import Flask
from main import db  # type: ignore # On importe db depuis main
from models import User, AccountPersonnalisation, Conversation # type: ignore
from chatbot import est_question_cuisine, get_user_personalization, reduce_conversation_history # type: ignore

# Configuration du test : on crée une nouvelle app Flask et on attache db à cette app
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
        db.drop_all()  # Nettoie après les tests

# Test simple pour est_question_cuisine
def test_est_question_cuisine(test_app):
    # On teste deux cas :
    # 1. Une question de cuisine
    result_cuisine = est_question_cuisine("Comment faire une tarte aux pommes ?")
    assert result_cuisine is True

    # 2. Une question ne concernant pas la cuisine
    result_non_cuisine = est_question_cuisine("Quel est le dernier film de Marvel ?")
    assert result_non_cuisine is False

# Test de get_user_personalization pour un utilisateur avec personnalisation
def test_get_user_personalization(test_app):
    # Création d'un utilisateur et de sa personnalisation dans la DB
    with test_app.app_context():
        user = User(
            username="user_test", 
            first_name="Test", 
            last_name="User", 
            password_hash="dummy_hash"
        )
        db.session.add(user)
        db.session.commit()

        personalization = AccountPersonnalisation(
            user_id=user.id,
            diet="Végétarien",
            food_goal="Perte de poids",
            allergies="Arachides",
            banned_ingredients="Gluten",
            kitchen_equipment="Four, Mixeur"
        )
        db.session.add(personalization)
        db.session.commit()

        # Test de get_user_personalization pour cet utilisateur
        result = get_user_personalization("user_test")
        assert "Régime alimentaire: Végétarien" in result
        assert "Objectif alimentaire: Perte de poids" in result
        assert "Allergies: Arachides" in result
        assert "Ingrédients à éviter: Gluten" in result
        assert "Équipement disponible: Four, Mixeur" in result

# Test de get_user_personalization pour un utilisateur sans personnalisation
def test_get_user_personalization_default(test_app):
    with test_app.app_context():
        user = User(
            username="nouser", 
            first_name="No", 
            last_name="User", 
            password_hash="dummy_hash"
        )
        db.session.add(user)
        db.session.commit()

        result = get_user_personalization("nouser")
        # La fonction doit renvoyer le message par défaut
        assert result == "Tu es un expert en cuisine. Tu ne réponds qu'aux questions sur la cuisine."


def test_reduce_conversation_history_court():
    """
    Teste que l'historique est retourné tel quel s'il contient 10 messages ou moins.
    """
    # Exemple d'historique avec moins de 10 messages (ici 4 messages)
    history = [
        {"role": "system", "content": "Système initial"},
        {"role": "user", "content": "Message 1"},
        {"role": "assistant", "content": "Réponse 1"},
        {"role": "user", "content": "Message 2"}
    ]
    result = reduce_conversation_history(history)
    # La fonction doit retourner exactement le même historique s'il y a <= 10 messages
    assert result == history

def test_reduce_conversation_history_long():
    """
    Teste que l'historique est réduit à 10 messages, en gardant le message système et les 9 derniers échanges.
    """
    system_message = {"role": "system", "content": "Message système"}
    # Crée 20 messages fictifs (user et assistant)
    messages = [{"role": "user", "content": f"Message {i}"} for i in range(1, 11)] + \
               [{"role": "assistant", "content": f"Réponse {i}"} for i in range(1, 11)]
    # Combine le système et ces 20 messages pour obtenir 21 messages au total
    history = [system_message] + messages

    result = reduce_conversation_history(history)
    # On s'attend à garder le premier message (système) + les 9 derniers messages de l'historique
    # Ici, les 9 derniers messages correspondent à history[-9:]
    expected = [system_message] + history[-9:]
    assert result == expected


