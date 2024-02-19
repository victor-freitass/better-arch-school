"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Queries {
    constructor() {
        this.student = 'SELECT * FROM student_social_media sm WHERE sm.email = $1';
        this.school_team = 'SELECT * FROM school_team st WHERE st.email = $1';
        this.school_teamPass = 'SELECT st.password FROM school_team st WHERE st.email = $1';
    }
}
exports.default = new Queries();
