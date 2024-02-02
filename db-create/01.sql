CREATE TYPE offices as ENUM ('teacher', 'coordinator', 'director');

CREATE TABLE IF NOT EXISTS school_team (
    id SERIAL PRIMARY KEY,
    user_name varchar(20) UNIQUE,
    office offices,
    profile_photo varchar (255) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    password varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS student (
    id SERIAL PRIMARY KEY,
    name varchar(50) NOT NULL,
    responsible_email varchar(50) UNIQUE NOT NULL
);