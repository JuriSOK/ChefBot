import pytest
import os
from datetime import timedelta
from config import Config # type: ignore

# Test de la classe Config
class TestConfig:
    def test_secret_key(self):
        """Teste que la clé secrète est bien générée et a la bonne longueur."""
        assert isinstance(Config.SECRET_KEY, str)
        assert len(Config.SECRET_KEY) == 64  # 32 bytes en hexadécimal

    def test_jwt_secret_key(self):
        """Teste que la clé secrète JWT est bien générée et a la bonne longueur."""
        assert isinstance(Config.JWT_SECRET_KEY, str)
        assert len(Config.JWT_SECRET_KEY) == 64  # 32 bytes en hexadécimal

    def test_jwt_token_expiration(self):
        """Teste que la durée d'expiration du token JWT est correcte."""
        assert Config.JWT_ACCESS_TOKEN_EXPIRES == timedelta(minutes=20)

    def test_database_uri(self):
        """Teste que l'URI de la base de données est correctement formée."""
        assert Config.SQLALCHEMY_DATABASE_URI.startswith("sqlite:///")
        assert "instance/users.db" in Config.SQLALCHEMY_DATABASE_URI

    def test_sqlalchemy_track_modifications(self):
        """Teste que le suivi des modifications est désactivé."""
        assert Config.SQLALCHEMY_TRACK_MODIFICATIONS is False

    def test_mail_configuration(self):
        """Teste la configuration du serveur mail."""
        assert Config.MAIL_SERVER == "smtp.gmail.com"
        assert Config.MAIL_PORT == 587
        assert Config.MAIL_USE_TLS is True
        assert Config.MAIL_USERNAME == "no.reply.chefbot@gmail.com"
        assert Config.MAIL_PASSWORD == "bcls sxoy komf oxpo"

    def test_paths(self):
        """Teste que les chemins de base sont correctement définis."""
        from config import BASE_DIR, INSTANCE_DIR # type: ignore
        assert os.path.isabs(BASE_DIR)
        assert os.path.isabs(INSTANCE_DIR)
        assert INSTANCE_DIR.endswith("/instance")
        assert BASE_DIR in INSTANCE_DIR