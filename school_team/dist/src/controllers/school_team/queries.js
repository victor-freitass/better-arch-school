"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Queries {
    constructor() {
        this.insert = 'INSERT INTO school_team (user_name, office, profile_photo, email, password) VALUES ($1, $2, $3, $4, $5)';
        this.getEmailFromDB = 'SELECT st.email FROM school_team st WHERE email = $1';
        this.getEmailFromSocialMediaDB = 'SELECT * FROM student_social_media WHERE email = $1';
        this.getUser_nameFromDB = 'SELECT st.user_name FROM school_team st WHERE user_name = $1';
        this.getUser_nameFromSocialMEdiaDB = 'SELECT sm.user_name FROM student_social_media sm WHERE user_name = $1';
    }
}
exports.default = new Queries();
