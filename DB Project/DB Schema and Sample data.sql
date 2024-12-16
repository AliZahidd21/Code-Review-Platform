CREATE DATABASE QuestionAnswerPlatform;

USE QuestionAnswerPlatform;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

CREATE TABLE questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    views INT DEFAULT 0,
    upvotes INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Answer Table
CREATE TABLE answers (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    user_id INT NOT NULL,
    body TEXT NOT NULL,
    code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    upvotes INT DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tag Table
CREATE TABLE tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE question_tags (
    question_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (question_id, tag_id),
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    parent_id INT NOT NULL,
    parent_type ENUM('question', 'answer') NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

INSERT INTO users (username, email, password_hash, profile_picture, bio, last_login)
VALUES
('Alice', 'alice@example.com', 'hashedpassword1', 'https://example.com/alice.jpg', 'Software Developer', NOW()),
('Bob', 'bob@example.com', 'hashedpassword2', 'https://example.com/bob.jpg', 'Data Scientist', NOW()),
('Charlie', 'charlie@example.com', 'hashedpassword3', NULL, 'AI Enthusiast', NULL);

INSERT INTO questions (user_id, title, body, code, views, upvotes)
VALUES
(1, 'How to implement a linked list in C++?', 'I need help implementing a singly linked list.', 'class Node { ... }', 10, 5),
(2, 'What is the best way to preprocess data for machine learning?', 'Should I normalize or standardize?', NULL, 25, 15);

INSERT INTO answers (question_id, user_id, body, code, upvotes)
VALUES
(1, 3, 'You can start by creating a Node class.', 'class Node { int data; Node* next; };', 8),
(2, 1, 'It depends on your dataset and algorithm.', NULL, 12);

INSERT INTO tags (tag_name, description)
VALUES
('C++', 'Questions related to the C++ programming language.'),
('Machine Learning', 'Questions related to ML techniques and algorithms.'),
('Data Preprocessing', 'Topics on data cleaning, normalization, and standardization.');

INSERT INTO question_tags (question_id, tag_id)
VALUES
(1, 1), 
(2, 2), 
(2, 3); 

INSERT INTO comments (user_id, parent_id, parent_type, body)
VALUES
(2, 1, 'question', 'Have you tried using a doubly linked list?'),
(3, 1, 'answer', 'Good explanation, but you missed error handling.');

