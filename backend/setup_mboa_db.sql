-- Script de configuration PostgreSQL pour MBOA Market
-- Création de la base de données et de l'utilisateur

-- Créer la base de données (si elle n'existe pas)
CREATE DATABASE mboa_market;

-- Créer l'utilisateur
CREATE USER mboa_user WITH PASSWORD 'mboa_password';

-- Donner tous les privilèges
GRANT ALL PRIVILEGES ON DATABASE mboa_market TO mboa_user;

-- Se connecter à la base mboa_market
\c mboa_market

-- Donner les privilèges sur le schéma public
GRANT ALL ON SCHEMA public TO mboa_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mboa_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mboa_user;

-- Activer les extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Message de confirmation
\echo 'Base de données MBOA Market créée avec succès!'
