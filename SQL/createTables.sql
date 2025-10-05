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
