# Importation des modules nécessaires
from flask import request, jsonify, url_for, session, redirect
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from src.main import app, db, mail
from werkzeug.security import generate_password_hash
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer
from src.models import User, Conversation, ResetToken, AccountPersonnalisation, Favorite
import json
import time
import sqlalchemy
from flask_cors import cross_origin
from sqlalchemy import desc

# Initialisation de la sérialisation pour générer des tokens sécurisés
serial = URLSafeTimedSerializer(app.config["SECRET_KEY"])

# Route pour la page d'accueil
@app.route("/")
def home():
    # Vérifie si l'utilisateur est connecté
    if "username" in session:
        return redirect(url_for('dashboard'))  # Redirige vers le tableau de bord
    else:
        return "<h1 style=\"text-align:center\">backend de la page de login & signup</h1>"

# Route pour la connexion
@app.route("/login", methods=["POST"])
def login():
    # Récupération des données de la requête
    data = request.json
    username = data.get('email')
    password = data.get('password')
    
    # Recherche de l'utilisateur dans la base de données
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):  # Vérifie le mot de passe
        if user.is_verified:  # Vérifie si l'utilisateur a confirmé son email
            access_token = create_access_token(identity=username)  # Génère un token JWT
            return jsonify({"message": "Connexion réussie", "token": access_token}), 200
        else:
            return jsonify({"message": "Votre Adresse e-mail n'est toujours pas vérifiée, veuillez consulter votre boite mail"}), 200
    else:
        return jsonify({"message": "Email ou mot de passe incorrect"}), 200

# Route pour l'inscription
@app.route("/signup", methods=["POST"])
@cross_origin()
def register():
    # Récupération des données de la requête
    data = request.json
    username = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    password = data.get('password')
    
    # Vérifie si l'utilisateur existe déjà
    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify({"message": "Cet utilisateur est déjà inscrit sur notre plateforme !", "status": "success"}), 200
    else:
        # Création d'un nouvel utilisateur
        new_user = User(username=username, first_name=first_name, last_name=last_name)
        new_user.set_password(password)  # Hashage du mot de passe
        db.session.add(new_user)
        db.session.commit()

        # Génération d'un token de confirmation d'email
        token = new_user.get_token(3600, "email-confirmation")
        confirm_url = url_for("confirm_email", token=token, _external=True)

        # Préparation et envoi de l'email de confirmation
        subject = "No-reply : Confirmation de votre adresse e-mail" 
        body = f"Bonjour {last_name.upper()},\n\nCliquez sur le lien suivant pour confirmer votre adresse email :\n{confirm_url}\n\nCe lien expire dans 10 minutes."
        msg = Message(subject=subject, sender=app.config["MAIL_USERNAME"], recipients=[username])
        msg.body = body
        msg.subject = subject
        mail.send(message=msg)

        return jsonify({"message": "Inscription réussie, Un email de confirmation vous a été envoyé.", "status": "success"}), 200

# Route pour confirmer l'email
@app.route("/confirm_mail/<token>", methods=["GET"])
def confirm_email(token):
    try:
        # Vérifie et décode le token
        user_id = User.verify_token(token, 3600, "email-confirmation")
    except Exception as e:
        return jsonify({"message": "Le lien est invalide ou a expire", "error": str(e)}), 200
    
    # Recherche de l'utilisateur
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"message": "Utilisateur introuvable"}), 200
    if user.is_verified:
        return jsonify({"message": "Compte déjà vérifié"}), 200

    # Marque l'utilisateur comme vérifié
    user.is_verified = True
    db.session.commit()
    return redirect("https://chefbot-front.onrender.com/login")

# Route pour réinitialiser le mot de passe
@app.route("/reset_password", methods=['GET','POST'])
def reset_password():
    data = request.json
    username = data.get('email')
    user =  User.query.filter_by(username=username).first()
    if user : 
        if not user.is_verified:
            return jsonify({"message":"Utilisateur non vérifié"}),200
        token = user.get_token(600, "password_change")
        my_token = ResetToken(user_id=user.id, token=token)
        db.session.add(my_token)
        db.session.commit()
        subject = "No-reply : Réinitialisation du mot de passe"
        confirm_url = f"https://chefbot-front.onrender.com/inputNewPassword?token={token}"
        body = f"Bonjour {user.last_name.upper()},\n\nCliquez sur le lien suivant pour réinitialiser votre mot de passe :\n\n{confirm_url}\n\nMerci d'ignorer cet émail si vous n'êtes pas à l'origine de cette opération (Demande de réinitialisation du mot de passe). Ce lien est valable pour une seule modification de mot de passe et expire dans 10 minutes."
        msg = Message(subject=subject, sender=app.config["MAIL_USERNAME"], recipients=[username])
        msg.subject = subject
        msg.body = body
        mail.send(msg)
        return jsonify({"message": "Un email de réinitialisation vous a été envoyé", "status": "success"}), 200
    else:
        return jsonify({"message": "Utilisateur introuvable"}), 200

# Route pour changer le mot de passe avec un token
@app.route("/change_password", methods=['GET','POST'])
def reset_token():
    data = request.json
    token = data.get('token')
    my_token = ResetToken.query.filter_by(token=token).first()
    if (not my_token) :
        return jsonify({"message": "Le token est invalide"}), 200
    if (my_token.is_expired()):
        return jsonify({"message": "Le token est déjà utilisé"}), 200
    else:
        my_token.use_it()
    try:
        user_id = User.verify_token(token=token, expires_sec=600, SALT="password_change")
        if user_id is None :
            return jsonify({"message": "Le lien est invalide ou a expiré"}), 200
    except Exception as e:
        return jsonify({"message": "Le lien est invalide ou a expiré", "error":str(e)}), 200
    user = User.query.filter_by(id=user_id).first()
    password = data.get('pswd')
    user.set_password(password)
    db.session.commit()
    return jsonify({"message": "Mot de passe changé"}), 200

# Route pour le tableau de bord
@app.route("/dashboard", methods=['GET', 'POST'])
@jwt_required()
def dashboard():
    try:
        email = get_jwt_identity()
        user = User.query.filter_by(username=email).first()
        name =user.last_name if user else ""
        surname=user.first_name if user else ""
        return jsonify({"message": "Token valide", "user": email, "name":name, "surname":surname}), 200
    except Exception as e:
        return jsonify({"message": "Token manquant ou invalide !!", "error": str(e)}), 200

# Route pour récupérer les conversations de l'utilisateur
@app.route("/conversations", methods=["GET"])
@jwt_required()
def get_conversations():
    """
    Méthode pour récupérer toutes les conversations d'un utilisateur.
    
    Étapes :
    1. Récupère l'identité de l'utilisateur via le token JWT.
    2. Filtre les conversations dans la base de données en fonction de l'utilisateur.
    3. Trie les conversations par date de création (ordre décroissant).
    4. Retourne les conversations sous forme de liste JSON.

    Arguments :
    - Aucun argument direct (les données sont récupérées via le token JWT).

    Retourne :
    - JSON : Liste des conversations avec leurs ID, titres et dates de création.
    """
    email = get_jwt_identity()  # Récupération de l'identité de l'utilisateur
    user = User.query.filter_by(username=email).first()
    conversations = Conversation.query.filter_by(user_id=user.id).order_by(desc(Conversation.created_at)).all()
    return jsonify([{"id": conv.id, "title": conv.title, "created_at": conv.created_at} for conv in conversations]), 200

# Route pour récupérer une conversation spécifique
@app.route("/conversations/<int:conversation_id>", methods=["GET"])
@jwt_required()
def get_conversation(conversation_id):
    """
    Méthode pour récupérer une conversation spécifique d'un utilisateur.
    
    Étapes :
    1. Récupère l'identité de l'utilisateur via le token JWT.
    2. Recherche la conversation dans la base de données en fonction de l'ID et de l'utilisateur.
    3. Vérifie si la conversation existe.
    4. Retourne les détails de la conversation (ID, titre, messages) sous forme JSON.

    Arguments :
    - conversation_id (int) : ID de la conversation à récupérer.

    Retourne :
    - JSON : Détails de la conversation ou un message d'erreur si elle n'existe pas.
    """
    email = get_jwt_identity()  # Récupération de l'identité de l'utilisateur
    user = User.query.filter_by(username=email).first()
    conversation = Conversation.query.filter_by(id=conversation_id, user_id=user.id).first()
    if not conversation:
        return jsonify({"message": "Conversation non trouvée"}), 404
    return jsonify({"id": conversation.id, "title": conversation.title, "messages": conversation.messages}), 200

# Route pour créer une nouvelle conversation
@app.route("/conversations", methods=["POST"])
@jwt_required()
def create_conversation():
    """
    Méthode pour créer une nouvelle conversation pour un utilisateur.
    
    Étapes :
    1. Récupère l'identité de l'utilisateur via le token JWT.
    2. Récupère les données de la requête (titre de la conversation).
    3. Crée une nouvelle instance de Conversation avec un titre par défaut si aucun n'est fourni.
    4. Ajoute la conversation à la base de données.
    5. Gère les erreurs potentielles liées au verrouillage de la base de données.
    6. Retourne les détails de la conversation créée sous forme JSON.

    Arguments :
    - Aucun argument direct (les données sont récupérées via `request.json`).

    Retourne :
    - JSON : Détails de la conversation créée ou un message d'erreur en cas d'échec.
    """
    email = get_jwt_identity()  # Récupération de l'identité de l'utilisateur
    user = User.query.filter_by(username=email).first()
    data = request.json  # Récupération des données de la requête
    title = data.get("title", "Nouvelle Conversation")  # Titre par défaut si non fourni

    # Création d'une nouvelle conversation
    conversation = Conversation(user_id=user.id, title=title, messages="[]")
    db.session.add(conversation)

    # Gestion des erreurs pour réessayer les transactions en cas de verrouillage de la base de données
    for _ in range(5):
        try:
            db.session.commit()  # Enregistrement dans la base de données
            break
        except sqlalchemy.exc.OperationalError:
            db.session.rollback()  # Annuler la transaction en cas d'erreur
            time.sleep(1)  # Attendre avant de réessayer
    else:
        return jsonify({"message": "Erreur lors de la création de la conversation, veuillez réessayer."}), 500

    return jsonify({"id": conversation.id, "title": conversation.title, "created_at": conversation.created_at}), 201

# Route pour ajouter un message à une conversation
@app.route("/conversations/<int:conversation_id>/messages", methods=["POST"])
@jwt_required()
def add_message(conversation_id):
    email = get_jwt_identity()
    user = User.query.filter_by(username=email).first()
    data = request.json
    message = data.get("message")
    bot_response = data.get("bot_response")
    conversation = Conversation.query.filter_by(id=conversation_id, user_id=user.id).first()
    if not conversation:
        return jsonify({"message": "Conversation non trouvée"}), 404
    messages = json.loads(conversation.messages)
    messages.append({"role": "user", "content": message})
    if bot_response:
        messages.append({"role": "bot", "content": bot_response})
    conversation.messages = json.dumps(messages)

    # Gestion des erreurs pour réessayer les transactions en cas de verrouillage de la base de données
    for _ in range(5):
        try:
            db.session.commit()
            break
        except sqlalchemy.exc.OperationalError:
            db.session.rollback()  # Annuler la transaction en cas d'erreur
            time.sleep(1)
    else:
        return jsonify({"message": "Erreur lors de l'ajout du message, veuillez réessayer."}), 500

    return jsonify({"message": "Message ajouté"}), 200

# Route pour changer le prénom et le nom de l'utilisateur
@app.route("/changeNames", methods=["GET", "POST"])
@jwt_required()
def change_first_last_name():
    try:
        data = request.json
        email = get_jwt_identity()
        user = User.query.filter_by(username=email).first()
        new_first_name = data.get("firstName")
        new_last_name = data.get("lastName")
        user.set_first_name(new_first_name)
        user.set_last_name(new_last_name)
        db.session.commit()
        return jsonify({"message" : "Nom et Prenom changes avec succes"}), 200
    except Exception as error:
        return jsonify({"message": "Token manquant ou invalide !!", "error": str(error)}), 200

# Route pour changer le mot de passe de l'utilisateur
@app.route("/modifyPassword", methods=["GET","POST"])
@jwt_required()
def change_password():
    """
    Méthode pour changer le mot de passe de l'utilisateur.
    Étapes :
    1. Récupère les données de la requête.
    2. Vérifie l'authenticité du token JWT.
    3. Valide le mot de passe actuel de l'utilisateur.
    4. Met à jour le mot de passe avec le nouveau mot de passe fourni.
    5. Enregistre les modifications dans la base de données.

    Arguments :
    - Aucun argument direct (les données sont récupérées via `request.json`).

    Retourne :
    - JSON : Message de succès ou d'erreur.
    """
    try:
        # Récupération des données de la requête
        data = request.json
        email = get_jwt_identity()  # Identité de l'utilisateur via le token JWT
        user = User.query.filter_by(username=email).first()

        # Vérification du mot de passe actuel
        password = data.get("myActualPassword")
        new_password = data.get("myNewPassword")
        if user:
            if not user.check_password(password):  # Mot de passe actuel incorrect
                return jsonify({"message": "Mot de passe actuel incorrect"}), 200
            else:
                # Mise à jour du mot de passe
                user.set_password(new_password)
                db.session.commit()  # Enregistrement des modifications
                return jsonify({"message": "Mot de passe changé"}), 200
    except Exception as error:
        # Gestion des erreurs
        return jsonify({"message": "Token manquant ou invalide !!", "error": str(error)}), 200

# Route pour personnaliser le profil de l'utilisateur
@app.route("/personalize_my_profile", methods=["GET","POST"])
@jwt_required()
def personalize_profile() :
    try:
        data = request.get_json()
        email = get_jwt_identity()
        user = User.query.filter_by(username=email).first()
        new_personnalisation = AccountPersonnalisation.query.filter_by(user_id=user.id).first()
        if not new_personnalisation :
            new_personnalisation = AccountPersonnalisation(user_id=user.id)
            db.session.add(new_personnalisation)
        if (data.get("have_other_allergies", False)):
            new_personnalisation.allergies= json.dumps(data.get("myAllergies",[])+data.get("myOtherAllergies",[]))
        else:
            new_personnalisation.allergies= json.dumps(data.get("myAllergies",[]))
        new_personnalisation.banned_ingredients = json.dumps(data.get("myBannedIngredients",[]))
        new_personnalisation.diet = data.get("myDiet")
        new_personnalisation.food_goal = data.get("myFoodGoal")
        new_personnalisation.kitchen_equipment = json.dumps(data.get("myKitchenEquipment",[]))
        db.session.commit()
        return jsonify({"message" : "Nouvelle personnalisation prise en compte"}), 200
    except Exception as error:
        return jsonify({"message" : "Token manquant ou invalide !!"}), 200

# Route pour récupérer la personnalisation du profil de l'utilisateur
@app.route("/get_my_personnalisation", methods=["GET","POST"])
@jwt_required()
def get_personnalisation() :
    try:
        email = get_jwt_identity()
        user = User.query.filter_by(username=email).first()
        my_personnalisation = AccountPersonnalisation.query.filter_by(user_id=user.id).first()
        if not my_personnalisation:
            my_personnalisation = AccountPersonnalisation(user_id=user.id)
            db.session.add(my_personnalisation)
            db.session.commit()
        allergies = json.loads(my_personnalisation.allergies)
        if len(allergies)>0 and allergies[len(allergies)-1].startswith("Autres:"):
            have_other_allergies = True
            myOtherAllergies = allergies[len(allergies)-1]
            allergies = allergies[:-1]
        else :
            have_other_allergies= False
            myOtherAllergies = ""
        return jsonify({"message":"Personnalisation recuperee avec succes", 
                        "allergies":allergies,
                        "have_other_allergies" : have_other_allergies,
                        "myOtherAllergies": myOtherAllergies,
                        "banned_ingredients":json.loads(my_personnalisation.banned_ingredients),
                        "diet":my_personnalisation.diet,
                        "food_goal":my_personnalisation.food_goal,
                        "kitchen_equipment":json.loads(my_personnalisation.kitchen_equipment)
                    }), 200
    except Exception as error:
        return jsonify({"message":"Token manquant ou invalide !!"}), 200

# Route pour récupérer les favoris de l'utilisateur
@app.route("/get_my_favorites", methods=["GET","POST"])
@jwt_required()
def get_all_my_favorites():
    try:
        email= get_jwt_identity()
        user = User.query.filter_by(username=email).first()
        my_favorites = Favorite.query.filter_by(user_id=user.id).all()
        return jsonify({
                        "message": "Recuperation favoris utilisateur avec succes",
                        "favorites": [
                            {"id": favorite.id, "type": favorite.type, "title": favorite.title, "content": favorite.content}
                            for favorite in my_favorites
                        ],
                    }), 200 
    except Exception as error :
        return jsonify({"message":"Token manquant ou invalide !!"}), 200

# Route pour ajouter un favori
@app.route("/add_favorite", methods=["GET","POST"])
@jwt_required()
def add_favorite():
    try:
        data = request.json
        email = get_jwt_identity()
        user = User.query.filter_by(username=email).first()
        favorite = Favorite(user_id=user.id, type=data.get("type"), title=data.get("title"), content=data.get("content"))
        db.session.add(favorite)
        db.session.commit()
        return jsonify({"message":"Favoris ajoute avec succes"}), 200
    except Exception as error:
        return jsonify({"message":"Token manquant ou invalide !!"}), 200
    
# Route pour supprimer un favoris
@app.route("/deleteFavorite", methods=["GET","POST"])
@jwt_required()
def delete_favorite():
    try:
        data= request.json
        email= get_jwt_identity()
        user = User.query.filter_by(username=email).first()
        if not user:
            return jsonify({"message":"Token épuisé ou invalide!"}), 200
        favorite = Favorite.query.filter_by(id=data.get("id"), user_id=user.id).first()
        if not favorite:
            return jsonify({"message":"Favoris à supprimer non trouvée!"}), 200
        db.session.delete(favorite)
        db.session.commit()
        return jsonify({"message":"Favoris supprimé avec succées"}), 200
    except Exception as error:
        return jsonify({"message":"Token épuisé ou invalide!"}), 200

@app.route("/conversations/<int:conversation_id>", methods=["DELETE"])
@jwt_required()
def delete_conversation(conversation_id):
    email = get_jwt_identity()
    user = User.query.filter_by(username=email).first()
    conversation = Conversation.query.filter_by(id=conversation_id, user_id=user.id).first()
    
    if not conversation:
        return jsonify({"message": "Conversation introuvable"}), 404
    
    db.session.delete(conversation)
    db.session.commit()
    return jsonify({"message": "Conversation supprimée 🗑️"}), 200
