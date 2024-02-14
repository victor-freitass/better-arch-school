class Queries {
    insert = 'INSERT INTO photos (url, user_name) VALUES ($1, $2) RETURNING *';
    getPhotoAlreadyExists = 'SELECT * FROM photos WHERE user_name = $1 and url = $2';
    getAll = 'SELECT url, createdAt FROM photos WHERE user_name = $1';
    delete = 'DELETE FROM photos where id = $1 and user_name = $2 RETURNING *';
    updateProfile = 'UPDATE student_social_media SET profile_photo = $1 WHERE user_name = $2 RETURNING *';
}

export default new Queries();