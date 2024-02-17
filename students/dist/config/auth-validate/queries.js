"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Queries {
    constructor() {
        this.getStudent = 'SELECT * FROM student_social_media WHERE email = $1';
        this.getPass = 'SELECT sm.password FROM student_social_media sm WHERE email = $1';
    }
}
exports.default = new Queries();
