import pytest
import sys
import os

# Ajouter src/ au chemin d'import
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
from chatbot import app, chatbot_response, conversation_history, client

# Fonction factice pour simuler les réponses de client.chat.completions.create
def fake_chat_completions_create(**kwargs):
    messages = kwargs.get("messages", [])
    # Cas de classification (2 messages avec le rôle du system définissant le classificateur)
    if len(messages) == 2 and "classificateur de questions" in messages[0]["content"]:
        user_text = messages[1]["content"].lower()
        if "cuisine" in user_text or "recette" in user_text or "plat" in user_text:
            response_text = "OUI"
        else:
            response_text = "NON"
    else:
        # Cas conversationnel
        response_text = "Réponse simulée sur la cuisine."
    # Créer un objet factice pour simuler la réponse
    class FakeMessage:
        def __init__(self, content):
            self.content = content
    class FakeChoice:
        def __init__(self, content):
            self.message = FakeMessage(content)
    class FakeResponse:
        def __init__(self, content):
            self.choices = [FakeChoice(content)]
    return FakeResponse(response_text)

# Fixture pour remplacer la méthode de chat completions par la version factice
@pytest.fixture(autouse=True)
def patch_client(monkeypatch):
    monkeypatch.setattr(client.chat.completions, "create", fake_chat_completions_create)

# Fixture pour obtenir un client de test Flask
@pytest.fixture
def test_client():
    app.config["TESTING"] = True
    with app.test_client() as client_app:
        yield client_app

def test_chat_non_cuisine(test_client):
    # Test avec un message non relatif à la cuisine
    response = test_client.post("/chat", json={"message": "Bonjour, comment ça va ?"})
    json_data = response.get_json()
    assert response.status_code == 200
    assert "Je ne parle que de cuisine" in json_data["reply"]

def test_chat_cuisine(test_client):
    # Réinitialisation de l'historique pour un test propre
    global conversation_history
    conversation_history = [
        {"role": "system", "content": "Tu es un expert en cuisine. Tu ne réponds qu'aux questions sur la cuisine."}
    ]
    # Test avec une question sur une recette
    response = test_client.post("/chat", json={"message": "Donne-moi une recette de quiche."})
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data["reply"] == "Réponse simulée sur la cuisine."