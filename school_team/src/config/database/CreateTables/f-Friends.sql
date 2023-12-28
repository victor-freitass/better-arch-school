CREATE TABLE IF NOT EXISTS friends (
    student_one varchar(50) not null references student_social_media (user_name),
    student_two varchar(50) not null references student_social_media (user_name)
) 