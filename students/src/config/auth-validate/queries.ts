class Queries {
    getStudent = 'SELECT * FROM student_social_media WHERE email = $1';
    getPass = 'SELECT sm.password FROM student_social_media sm WHERE email = $1';
}

export default new Queries();