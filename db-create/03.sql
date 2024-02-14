CREATE TABLE IF NOT EXISTS photos (
    id serial primary key,
    url varchar(255) not null, 
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_name VARCHAR (50) not null references student_social_media (user_name) 
);

CREATE TABLE IF NOT EXISTS friends (
    student_one varchar(50) not null references student_social_media (user_name),
    student_two varchar(50) not null references student_social_media (user_name)
); 

create table classes (
	name varchar(15) unique not null primary key,
	student_count integer,
	avarage real,
	students_id integer[]
);