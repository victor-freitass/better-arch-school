class Queries {
    getStudentId = 'SELECT s.id from student s, student_social_media sm WHERE sm.user_name = $1 and sm.student_id = s.id';
    getStudent = "SELECT a.*, n.n1, n.n2, n.n3, n.n4, n.n5, n.media, CASE WHEN n.media < 4 THEN 'REPROVADO' when n.media < 6 THEN 'RECUPERAÇÃO' ELSE 'APROVADO' END AS Avaliacao FROM student a, grades n WHERE a.id = $1 and a.id =  n.id_student";

    verifyFriends = "select * from friends f where f.student_one = $1 and f.student_two = $2 or f.student_one = $2 and f.student_two = $1";
    verifyIfIsTeam = 'SELECT * FROM school_team WHERE user_name = $1';
    getStudentPerfil = 'SELECT user_name, profile_photo, bio FROM student_social_media WHERE user_name = $1';
    getTeamPerfil = 'SELECT user_name, profile_photo FROM school_team WHERE user_name = $1';
}

export default new Queries();