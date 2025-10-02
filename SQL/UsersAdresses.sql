CREATE TABLE UsersAdresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(255) NOT NULL,
    complement VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    zipCode VARCHAR(255) NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id)
);
