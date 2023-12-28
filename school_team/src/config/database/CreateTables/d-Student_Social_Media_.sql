CREATE TABLE IF NOT EXISTS student_social_media (
    user_name VARCHAR(50) NOT NULL PRIMARY KEY UNIQUE,
    student_id integer UNIQUE NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_photo VARCHAR(100) NOT NULL,
    bio VARCHAR(30),
    friend_requests VARCHAR(50)[],
    FOREIGN KEY (student_id) references student(id)
)