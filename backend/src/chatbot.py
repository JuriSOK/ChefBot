from flask import Blueprint, request, jsonify
from src.main import app, client, db
from src.models import Conversation
import json
from src.models import User, Conversation, AccountPersonnalisation  # Ajout de AccountPersonnalisation


# Fonction pour déterminer si une question concerne la cuisine
def est_question_cuisine(user_input):
    """
    Vérifie si une question ou un message concerne la cuisine.

    Étapes :
    1. Envoie le message de l'utilisateur à l'API OpenAI pour classification.
    2. L'API répond par 'OUI' si la question concerne la cuisine, sinon 'NON'.
    3. Analyse la réponse pour déterminer si elle contient 'OUI'.

    Arguments :
    - user_input (str) : Le message ou la question de l'utilisateur.

    Retourne :
    - bool : True si la question concerne la cuisine, False sinon.
    """
    # Appel à l'API OpenAI pour classifier la question
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # Modèle utilisé pour la classification
        messages=[
            {
                "role": "system",
                "content": (
                    "Tu es un classificateur de questions. Pour chaque question, réponds uniquement par 'OUI' "
                    "si la question concerne la cuisine (cuisine, ingrédients, etc...), ou par 'NON' dans le cas contraire. Ne donne aucune explication."
                )
            },
            {"role": "user", "content": user_input}  # Message de l'utilisateur à classifier
        ]
    )
    # Extraire la classification et vérifier si elle contient "OUI"
    classification = response.choices[0].message.content.strip().upper()
    return "OUI" in classification




def get_user_personalization(username):
    """
    Récupère les préférences culinaires d'un utilisateur et génère un prompt personnalisé pour le chatbot.
    
    Cette fonction interroge la base de données pour obtenir les informations de personnalisation
    (régime alimentaire, allergies, équipement disponible, etc.) et les formate dans un prompt
    clair pour guider les réponses du chatbot.

    Args:
        username (str): L'email de l'utilisateur (User.username)

    Returns:
        str: Un message système personnalisé contenant :
             - Une base fixe ("Tu es un expert en cuisine...")
             - Les préférences spécifiques de l'utilisateur formatées en bullet points
             - Retourne le message de base si aucune personnalisation n'est trouvée

    Exemple de retour:
        "Tu es un expert en cuisine...\n- Régime: Végétarien\n- Allergies: Arachides..."
    """

    # 1. Trouver l'utilisateur par son email
    user = User.query.filter_by(username=username).first()

    if not user:
        print(f"❌ Utilisateur {username} introuvable")
        return "Tu es un expert en cuisine..."

    # 2. Maintenant utiliser user.id pour la personnalisation
    personalization = AccountPersonnalisation.query.filter_by(user_id=user.id).first()
    print(personalization);
       
    
    # Retourne le message par défaut si aucune personnalisation n'existe
    if not personalization:
        return "Tu es un expert en cuisine. Tu ne réponds qu'aux questions sur la cuisine."
    
    # Base du prompt système
    system_prompt = "Tu es un expert en cuisine. Tu ne réponds qu'aux questions sur la cuisine en tenant compte des préférences suivantes:\n"
    
    # Ajout du régime alimentaire si spécifié (et différent de la valeur par défaut)
    if personalization.diet and personalization.diet != "Aucun régime":
        system_prompt += f"- Régime alimentaire: {personalization.diet}\n"
    
    # Ajout de l'objectif alimentaire si spécifié
    if personalization.food_goal and personalization.food_goal != "Aucun objectif":
        system_prompt += f"- Objectif alimentaire: {personalization.food_goal}\n"
    
    # Ajout des allergies si renseignées (chaîne non vide)
    if personalization.allergies:
        system_prompt += f"- Allergies: {personalization.allergies}\n"
    
    # Ajout des ingrédients à éviter si renseignés
    if personalization.banned_ingredients:
        system_prompt += f"- Ingrédients à éviter: {personalization.banned_ingredients}\n"
    
    # Ajout de l'équipement de cuisine disponible
    if personalization.kitchen_equipment:
        system_prompt += f"- Équipement disponible: {personalization.kitchen_equipment}\n"
    
    print(system_prompt)
    return system_prompt



def reduce_conversation_history(history):
    """
    Réduit l'historique de conversation à 10 messages maximum en conservant :
    - Le message système (toujours en première position)
    - Les 9 derniers échanges (user/assistant)
    
    Args:
        history (list): Liste complète des messages de la conversation
        
    Returns:
        list: Historique tronqué à 10 messages max
    """
    if len(history) <= 10:
        return history
    
    # Garde le message système (premier élément)
    system_message = history[0]
    
    # Garde les 9 derniers messages (en supposant qu'ils forment des paires user/assistant)
    recent_messages = history[-9:]
    
    # Recombine en gardant le contexte système
    return [system_message] + recent_messages




# Route Flask pour gérer les messages d'une conversation spécifique
@app.route('/chat/<int:conversation_id>', methods=['POST'])
def chat(conversation_id):
    """
    Gère les messages d'une conversation spécifique avec mémoire limitée à 10 messages.

    Étapes :
    1. Récupère le message utilisateur et valide sa présence
    2. Charge la conversation depuis la base de données
    3. Met à jour le titre si c'est le premier message
    4. Construit l'historique en incluant les personnalisations utilisateur
    5. Limite l'historique à 10 messages (1 système + 9 derniers échanges)
    6. Vérifie si la question concerne la cuisine
    7. Appelle l'API OpenAI ou retourne une réponse par défaut
    8. Sauvegarde l'historique tronqué et retourne la réponse

    Args:
        conversation_id (int): ID de la conversation dans la table Conversation

    Request Body (JSON):
        {"message": "texte de l'utilisateur"}

    Returns:
        JSON: {"reply": "réponse du bot"} ou erreur HTTP
    """
    # Récupérer les données JSON envoyées par le client
    data = request.get_json()
    user_input = data.get('message', '').strip()  # Extraire le message de l'utilisateur

    # Vérifier si un message a été fourni
    if not user_input:
        return jsonify({'error': 'Aucun message fourni'}), 400

    # Charger la conversation depuis la base de données
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({'error': 'Conversation non trouvée'}), 404

    # Charger l'historique des messages (stocké en JSON dans la base de données)
    messages = json.loads(conversation.messages) if conversation.messages else []

    # Vérifier si c'est le premier message de l'utilisateur dans cette conversation
    if not messages or all(msg['role'] == 'system' for msg in messages):
        # Extraire les 5 premiers mots du message pour générer un nouveau titre
        words = user_input.split()[:5]
        new_title = ' '.join(words)
        # Limiter le titre à 50 caractères pour éviter qu'il soit trop long
        if len(new_title) > 50:
            new_title = new_title[:50] + '...'
        # Mettre à jour le titre de la conversation dans la base de données
        conversation.title = new_title
        db.session.commit()

    # Construire l'historique des messages pour l'API OpenAI
    history = [{"role": msg["role"], "content": msg["content"]} for msg in messages]
    
    # Ajouter un message système si l'historique est vide ou ne contient pas de message système
    if not history or history[0]["role"] != "system":
         
        #history.insert(0, {"role": "system", "content": "Tu es un expert en cuisine. Tu ne réponds qu'aux questions sur la cuisine."})

        userid = conversation.user_id
        #print(username)
        user = User.query.filter_by(id=userid).first()
        #print(user)
        user_username = user.username
        system_prompt = get_user_personalization(user_username)
        print(f"System prompt: {system_prompt}")  # Debug: Afficher le message système
        history.insert(0, {"role": "system", "content": system_prompt})

    

    # Ajouter le message de l'utilisateur à l'historique
    history.append({"role": "user", "content": user_input})

    # Réduire l'historique à 10 messages maximum
    history = reduce_conversation_history(history)
    
    # Vérifier si la question concerne la cuisine
    if not est_question_cuisine(user_input):
        # Réponse par défaut si la question ne concerne pas la cuisine
        bot_reply = "Je ne parle que de cuisine ! Pose-moi une question sur les plats, les recettes ou les ingrédients. 😊"
    else:
        # Appeler l'API OpenAI avec l'historique complet pour obtenir une réponse
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Modèle utilisé pour générer la réponse
            messages=history  # Historique des messages à envoyer à l'API
        )
        bot_reply = response.choices[0].message.content.strip()  # Extraire la réponse du bot

    # Ajouter la réponse du bot à l'historique
    history.append({"role": "assistant", "content": bot_reply})

    # Mettre à jour les messages dans la base de données
    # Exclut le message système si nécessaire (ici, on exclut le premier message système)
    conversation.messages = json.dumps(history[1:])
    db.session.commit()

    # Retourner la réponse du bot au client
    return jsonify({'reply': bot_reply})


