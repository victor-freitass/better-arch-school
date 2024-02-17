"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Queries {
    constructor() {
        this.insert = 'INSERT INTO photos (url, user_name) VALUES ($1, $2) RETURNING *';
        this.getPhotoAlreadyExists = 'SELECT * FROM photos WHERE user_name = $1 and url = $2';
        this.getAll = 'SELECT url, createdAt FROM photos WHERE user_name = $1';
        this.delete = 'DELETE FROM photos where id = $1 and user_name = $2 RETURNING *';
        this.updateProfile = 'UPDATE student_social_media SET profile_photo = $1 WHERE user_name = $2 RETURNING *';
    }
}
exports.default = new Queries();
