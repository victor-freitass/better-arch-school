"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Queries {
    constructor() {
        this.getAll = 'SELECT * FROM friends WHERE student_one = $1 or student_two = $1';
        this.checkIfExists = 'SELECT * FROM student_social_media WHERE user_name = $1';
        this.checkAlreadyFriends = 'SELECT * FROM friends WHERE student_one = $1 and student_two = $2 or student_one = $2 and student_two = $1';
        this.getFriendRequests = 'SELECT friend_requests from student_social_media WHERE user_name = $1';
        this.sendFriendRequest = 'UPDATE student_social_media SET friend_requests = ARRAY_APPEND(friend_requests, $2) WHERE user_name = $1';
        this.removeRequest = 'UPDATE student_social_media SET friend_requests = ARRAY_REMOVE(friend_requests, $2) WHERE user_name = $1';
        this.insert = 'INSERT INTO friends (student_one, student_two) VALUES ($1, $2)';
    }
}
exports.default = new Queries();
