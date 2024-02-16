class Queries {
    insert = 'INSERT INTO school_team (user_name, office, profile_photo, email, password) VALUES ($1, $2, $3, $4, $5)';
    getEmailFromDB = 'SELECT st.email FROM school_team st WHERE email = $1';
    getEmailFromSocialMediaDB = 'SELECT * FROM student_social_media WHERE email = $1';
    getUser_nameFromDB = 'SELECT st.user_name FROM school_team st WHERE user_name = $1';
    getUser_nameFromSocialMEdiaDB = 'SELECT sm.user_name FROM student_social_media sm WHERE user_name = $1';
}

export default new Queries();