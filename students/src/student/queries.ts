class Queries {
    getStudentId = 'SELECT s.id from student s, student_social_media sm WHERE sm.user_name = $1 and sm.student_id = s.id';
    getStudent = "SELECT a.*, n.n1, n.n2, n.n3, n.n4, n.media, CASE WHEN n.media < 4 THEN 'REPROVADO' when n.media < 6 THEN 'RECUPERAÇÃO' ELSE 'APROVADO' END AS Avaliacao FROM student a, grades n WHERE a.id = $1 and a.id =  n.id_student";
}

export default new Queries();