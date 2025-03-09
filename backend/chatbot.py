from flask import request, jsonify
from main import app, client
from flask_cors import CORS  # Importer CORS

# Historique de conversation avec le message système initial
conversation_history = [
    {"role": "system", "content": "Tu es un expert en cuisine. Tu ne réponds qu'aux questions sur la cuisine."}
]

def est_question_cuisine(user_input):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "Tu es un classificateur de questions. Pour chaque question, réponds uniquement par 'OUI' "
                    "si la question concerne la cuisine (cuisine, ingrédients, etc...), ou par 'NON' dans le cas contraire. Ne donne aucune explication."
                )
            },
            {"role": "user", "content": user_input}
        ]
    )
    classification = response.choices[0].message.content.strip().upper()
    return "OUI" in classification

def chatbot_response(user_input):
    global conversation_history

    if not est_question_cuisine(user_input):
        return "Je ne parle que de cuisine ! Pose-moi une question sur les plats, les recettes ou les ingrédients. 😊"
    
    conversation_history.append({"role": "user", "content": user_input})
    conversation_history = [conversation_history[0]] + conversation_history[-10:]
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=conversation_history
    )
    
    bot_reply = response.choices[0].message.content.strip()
    conversation_history.append({"role": "assistant", "content": bot_reply})
    
    return bot_reply

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_input = data.get('message', '').strip()
    
    if not user_input:
        return jsonify({'error': 'Aucun message fourni'}), 400
    
    response = chatbot_response(user_input)
    return jsonify({'reply': response})
