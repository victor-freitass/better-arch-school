class Queries {
    getAll = 'SELECT * FROM friends WHERE student_one = $1 or student_two = $1';

    checkIfExists = 'SELECT * FROM student_social_media WHERE user_name = $1';
    checkAlreadyFriends = 'SELECT * FROM friends WHERE student_one = $1 and student_two = $2 or student_one = $2 and student_two = $1';
    getFriendRequests = 'SELECT friend_requests from student_social_media WHERE user_name = $1';
    sendFriendRequest = 'UPDATE student_social_media SET friend_requests = ARRAY_APPEND(friend_requests, $2) WHERE user_name = $1';
    
    removeRequest = 'UPDATE student_social_media SET friend_requests = ARRAY_REMOVE(friend_requests, $2) WHERE user_name = $1';
    insert = 'INSERT INTO friends (student_one, student_two) VALUES ($1, $2)';
}

export default new Queries();