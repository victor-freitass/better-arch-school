CREATE TABLE IF NOT EXISTS photos (
    id serial primary key,
    url varchar(255) UNIQUE not null, 
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_name VARCHAR (50) not null references student_social_media (user_name) 
);