"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Queries {
    constructor() {
        this.verifyFriends = "select * from friends f where f.student_one = $1 and f.student_two = $2 or f.student_one = $2 and f.student_two = $1";
        this.verifyIfIsTeam = 'SELECT * FROM school_team WHERE user_name = $1';
        this.getUserName = 'SELECT * FROM student_social_media sm, school_team st WHERE sm.user_name = $1 or st.user_name = $1';
    }
}
exports.default = new Queries();
