"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Queries {
    constructor() {
        this.insertStudent = 'INSERT INTO student (name, responsible_email) VALUES ($1, $2)';
        this.getNewStudentIdByEmail = 'SELECT id FROM student WHERE responsible_email = $1';
        this.getById = 'SELECT s.id FROM student s WHERE id = $1';
        this.getOneById = "SELECT a.*, n.n1, n.n2, n.n3, n.n4, n.media, CASE WHEN n.media < 4 THEN 'REPROVADO' when n.media < 6 THEN 'RECUPERAÇÃO' ELSE 'APROVADO' END AS Avaliacao FROM student a, grades n WHERE a.id = $1 and a.id = n.id_student";
        this.getStudentUser_name = 'SELECT user_name FROM student_social_media WHERE student_id = $1';
        this.classesCount = 'SELECT * FROM classes';
        this.createNewClass = 'INSERT INTO classes (name) VALUES ($1)';
        this.getCountClass = "SELECT students_id FROM classes WHERE name = $1";
        this.getResponsibleEmail = 'SELECT s.responsible_email FROM student s WHERE responsible_email = $1';
        this.getUser_nameFromSocialMedia = 'SELECT sm.user_name FROM student_social_media sm WHERE user_name = $1';
        this.checkIfExistsUser_nameInSchool_teamDB = 'SELECT st.user_name FROM school_team st WHERE user_name = $1';
        this.getEmailFromSocialMedia = 'SELECT sm.email FROM student_social_media sm WHERE email = $1';
        this.getDirectorPass = 'SELECT st.password FROM school_team st WHERE email = $1';
        this.insertGrades = 'INSERT INTO grades (id_student, n1, n2, n3, n4, n5, media) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        this.insertSocial_Media = 'INSERT INTO student_social_media (student_id, user_name, email, password, profile_photo, bio) VALUES ($1, $2, $3, $4, $5, $6)';
        this.verifyClass = 'SELECT * FROM classes WHERE name = $1';
        this.getClassStudents = 'SELECT students_id FROM classes WHERE name = $1';
        this.getStudentMediaById = 'SELECT media FROM grades WHERE id_student = $1';
        this.updateClass = "UPDATE classes SET student_count = student_count + 1, avarage = $2, students_id = ARRAY_APPEND(students_id, $3) WHERE name = $1";
        this.updateClassFirstStudent = 'UPDATE classes SET student_count = 1, avarage = $2, students_id = ARRAY_APPEND(students_id, $3) WHERE name = $1';
        this.findStudentClass = 'SELECT name FROM classes WHERE $1 = ANY (students_id);';
        this.updateGrades = 'UPDATE grades SET n1 = $2, n2 = $3, n3 = $4, n4 = $5, n5 = $6, media = $7 WHERE id_student = $1';
        this.deleteNewStudent = 'DELETE FROM student WHERE id = $1';
        this.newArray = 'SELECT ARRAY_REMOVE(students_id, $1) as array FROM classes WHERE name = $2';
        this.updateClassBecauseError = 'UPDATE classes SET student_count = student_count - 1, avarage = $1, students_id = $2 WHERE name = $3';
        this.deleteNewGrades = 'DELETE FROM grades WHERE id_student = $1';
        this.deleteSocialMedia = 'DELETE FROM student_social_media WHERE student_id = $1';
        this.deleteById = 'DELETE FROM student WHERE id = $1';
        this.deleteStudentFriendsTable = 'DELETE FROM friends WHERE student_one = $1 or student_two = $1';
        this.deleteStudentPhotos = 'DELETE FROM photos WHERE user_name = $1';
        this.getAll = "SELECT a.*, n.n1, n.n2, n.n3, n.n4, n.media, CASE WHEN n.media < 4 THEN 'REPROVADO' when n.media < 6 THEN 'RECUPERAÇÃO' ELSE 'APROVADO' END AS Avaliacao FROM student a, grades n WHERE a.id  = n.id_student";
        this.getStudentPerfil = 'SELECT user_name, profile_photo, bio FROM student_social_media WHERE email = $1';
        this.getTeamPerfil = 'SELECT user_name, profile_photo FROM school_team WHERE email = $1';
        this.getClasses = 'SELECT * FROM classes';
        this.studentGrade = 'SELECT media FROM grades WHERE id_student = $1';
        this.removeStudentOfTheArray = 'SELECT ARRAY_REMOVE(students_id, $1) FROM classes WHERE name = $2';
        this.getStudentClassById = 'SELECT * FROM classes WHERE $1 = ANY (students_id)';
        this.updateClassBecauseDelete = 'UPDATE classes SET student_count = student_count -1, students_id = $2 WHERE name = $1';
        this.updateClassAvarage = 'UPDATE classes SET avarage = $2 WHERE name = $1';
    }
}
exports.default = new Queries();
