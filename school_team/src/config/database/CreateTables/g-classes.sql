create table classes (
	name varchar(15) unique not null primary key,
	student_count integer,
	avarage real,
	students_id integer[]
)