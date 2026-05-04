-- Mettre à jour le mot de passe de mboa_user
ALTER USER mboa_user WITH PASSWORD 'mboa_password';

-- Vérifier que l'utilisateur existe
SELECT usename FROM pg_user WHERE usename = 'mboa_user';
