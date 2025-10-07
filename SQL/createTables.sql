CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    CPF VARCHAR(14),
    user_image VARCHAR(255),
    password VARCHAR(300) NOT NULL
);

CREATE TABLE users_addresses (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    street VARCHAR(255),
    number VARCHAR(10),
    complement VARCHAR(255),
    neighborhood VARCHAR(255),
    city VARCHAR(85),
    state VARCHAR(33),
    country VARCHAR(255),
    zipCode VARCHAR(20) NOT NULL
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    description VARCHAR(255) NOT NULL
);

CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    handle VARCHAR(80) NOT NULL UNIQUE,
    primary_domain VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'static',
  path VARCHAR(512) NOT NULL,
  canonical_url VARCHAR(1024),
  header JSONB NOT NULL DEFAULT '{}'::jsonb,
  footer JSONB NOT NULL DEFAULT '{}'::jsonb,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);