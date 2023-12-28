CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    id_student integer UNIQUE references student (id),
    n1 real,
    n2 real,
    n3 real,
    n4 real,
    n5 real,
    media real
)