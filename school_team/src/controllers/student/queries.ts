class Queries {
    insertStudent = 'INSERT INTO student (name, responsible_email) VALUES ($1, $2)';
    getNewStudentId = 'SELECT MAX(ID) FROM student';
    getNewStudentIdByEmail = 'SELECT id FROM student WHERE responsible_email = $1';
    getById = 'SELECT s.id FROM student s WHERE id = $1';
    getOneById = "SELECT a.*, n.n1, n.n2, n.n3, n.n4, n.media, CASE WHEN n.media < 4 THEN 'REPROVADO' when n.media < 6 THEN 'RECUPERAÇÃO' ELSE 'APROVADO' END AS Avaliacao FROM student a, grades n WHERE a.id = $1 and a.id = n.id_student";

    classesCount = 'SELECT * FROM classes';
    createNewClass = 'INSERT INTO classes (name) VALUES ($1)';
    getCountClass = "SELECT students_id FROM classes WHERE name = $1";

    getResponsibleEmail = 'SELECT s.responsible_email FROM student s WHERE responsible_email = $1';
    getUser_nameFromSocialMedia = 'SELECT sm.user_name FROM student_social_media sm WHERE user_name = $1';
    checkIfExistsUser_nameInSchool_teamDB = 'SELECT st.user_name FROM school_team st WHERE user_name = $1';
    getEmailFromSocialMedia = 'SELECT sm.email FROM student_social_media sm WHERE email = $1';
    getDirectorPass = 'SELECT st.password FROM school_team st WHERE email = $1';

    insertGrades =  'INSERT INTO grades (id_student, n1, n2, n3, n4, n5, media) VALUES ($1, $2, $3, $4, $5, $6, $7)';
    insertSocial_Media = 'INSERT INTO student_social_media (student_id, user_name, email, password, profile_photo, bio) VALUES ($1, $2, $3, $4, $5, $6)';

    verifyClass = 'SELECT * FROM classes WHERE name = $1';
    getClassStudents = 'SELECT students_id FROM classes WHERE name = $1';
    getStudentMediaById = 'SELECT media FROM grades WHERE id_student = $1';
    updateClass = "UPDATE classes SET student_count = student_count + 1, avarage = $2, students_id = ARRAY_APPEND(students_id, $3) WHERE name = $1";

    updateGrades = 'UPDATE grades SET n1 = $2, n2 = $3, n3 = $4, n4 = $5, n5 = $6, media = $7 WHERE id_student = $1';

    deleteNewStudent = 'DELETE FROM student WHERE id = $1';
    newArray = 'SELECT ARRAY_REMOVE(students_id, $1) as array FROM classes WHERE name = $2';
    updateClassBecauseError = 'UPDATE classes SET student_count = student_count - 1, avarage = $1, students_id = $2 WHERE name = $3';
    deleteNewGrades = 'DELETE FROM grades WHERE id_student = $1';
    deleteSocialMedia = 'DELETE FROM student_social_media WHERE student_id = $1'
    deleteById = 'DELETE FROM student WHERE id = $1';

    getAll = "SELECT a.*, n.n1, n.n2, n.n3, n.n4, n.media, CASE WHEN n.media < 4 THEN 'REPROVADO' when n.media < 6 THEN 'RECUPERAÇÃO' ELSE 'APROVADO' END AS Avaliacao FROM student a, grades n WHERE a.id  = n.id_student";
    getStudentPerfil = 'SELECT user_name, profile_photo, bio FROM student_social_media WHERE email = $1';
    getTeamPerfil = 'SELECT user_name, profile_photo FROM school_team WHERE email = $1';

    getClasses = 'SELECT * FROM classes';
}

export default new Queries();