-- Script d'initialisation PostgreSQL pour MBOA Market
-- Exécuter avec: psql -U postgres -f setup_postgres.sql

-- Créer la base de données
CREATE DATABASE mboa_market;

-- Créer l'utilisateur
CREATE USER mboa_user WITH PASSWORD 'mboa_password';

-- Donner tous les privilèges à l'utilisateur
GRANT ALL PRIVILEGES ON DATABASE mboa_market TO mboa_user;

-- Se connecter à la base de données
\c mboa_market

-- Donner les privilèges sur le schéma public
GRANT ALL ON SCHEMA public TO mboa_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mboa_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mboa_user;

-- Activer les extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Pour la recherche full-text

-- Afficher un message de succès
\echo 'Base de données MBOA Market créée avec succès!'
\echo 'Utilisateur: mboa_user'
\echo 'Base de données: mboa_market'
\echo 'Vous pouvez maintenant exécuter: python init_db.py'
