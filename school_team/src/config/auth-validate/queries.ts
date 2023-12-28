class Queries {
    student = 'SELECT * FROM student_social_media sm WHERE sm.email = $1';
    school_team = 'SELECT * FROM school_team st WHERE st.email = $1';
    school_teamPass = 'SELECT st.password FROM school_team st WHERE st.email = $1';
}



export default new Queries();