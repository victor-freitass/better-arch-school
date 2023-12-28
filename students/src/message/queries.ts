class Queries {
    verifyFriends = "select * from friends f where f.student_one = $1 and f.student_two = $2 or f.student_one = $2 and f.student_two = $1";
    verifyIfIsTeam = 'SELECT * FROM school_team WHERE user_name = $1';
}

export default new Queries();