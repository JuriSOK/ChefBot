from flask import request, jsonify, url_for, session, redirect
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from main import app, db, mail
from werkzeug.security import generate_password_hash
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer
from models import User

# Serialisation pour générer des tokens de vérification
s = URLSafeTimedSerializer(app.config["SECRET_KEY"])

@app.route("/")
def home():
    if "username" in session:
        return redirect(url_for('dashboard'))
    else: 
        return "<h1 style=\"text-align:center\">backend de la page de login & signup</h1>"

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        if user.is_verified:
            access_token = create_access_token(identity=username)
            return jsonify({"message": "Connexion réussie", "token": access_token}), 200
        else:
            return jsonify({"message": "Votre Adresse e-mail n'est toujours pas vérifiée, veuillez consulter votre boite mail"}), 200
    else:
        return jsonify({"message": "Email ou mot de passe incorrect"}), 200

@app.route("/signup", methods=["POST"])
def register():
    data = request.json
    username = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify({"message": "Cet utilisateur est déjà inscrit sur notre plateforme !", "status": "success"}), 200
    else:
        new_user = User(username=username, first_name=first_name, last_name=last_name)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        # Générer un token de vérification
        token = s.dumps(username, salt="email-confirmation")
        confirm_url = url_for("confirm_email", token=token, _external=True)

        # Préparer et envoyer l'émail
        subject = "No-reply : Confirmation de votre adresse e-mail"
        body = f"Bonjour {last_name.upper()},\n\nCliquez sur le lien suivant pour confirmer votre adresse email :\n{confirm_url}\n\nCe lien expire dans 10 minutes."
        msg = Message(subject=subject, sender=app.config["MAIL_USERNAME"], recipients=[username])
        msg.body = body
        msg.subject = subject   
        mail.send(message=msg)

        return jsonify({"message": "Inscription réussie, Un email de confirmation vous a été envoyé.", "status": "success"}), 200

@app.route("/confirm_mail/<token>", methods=["GET"])
def confirm_email(token):
    try:
        username = s.loads(token, salt="email-confirmation", max_age=600)
    except Exception as e:
        return jsonify({"message": "Le lien est invalide ou a expire", "error": str(e)}), 200
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "Utilisateur introuvable"}), 200
    if user.is_verified:
        return jsonify({"message": "Compte déjà vérifié"}), 200
    user.is_verified = True
    db.session.commit()
    return jsonify({"message": "Email verifie avec succes!"}), 200

@app.route("/dashboard", methods=['GET','POST'])
@jwt_required()
def dashboard():
    try:
        current_user = get_jwt_identity()
        return jsonify({"message": "bienvenu sur votre dashboard !", "user": current_user}), 200
    except Exception as e:
        return jsonify({"message": "Token manquant ou invalide !!", "error": str(e)}), 200
