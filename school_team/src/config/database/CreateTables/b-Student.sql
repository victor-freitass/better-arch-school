CREATE TABLE IF NOT EXISTS student (
    id SERIAL PRIMARY KEY,
    name varchar(50) NOT NULL,
    responsible_email varchar(50) UNIQUE NOT NULL
)