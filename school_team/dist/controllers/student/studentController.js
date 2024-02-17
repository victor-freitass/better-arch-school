"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pgConnection_1 = __importDefault(require("../../config/database/pgConnection"));
const queries_1 = __importDefault(require("./queries"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const validators_1 = require("../../config/validators");
class StudentController {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, responsible_email, n1, n2, n3, n4, n5, student_class, user_name, email, password, profile_photo, bio } = req.body;
            if ((req.token.payload.office) === 'teacher') {
                return res.status(401).send('Teachers are not allowed to insert someone. Just directors and coordinators.');
            }
            //to accept grades = 0, and verify all input
            if (!(name && responsible_email && student_class && user_name &&
                email && password && profile_photo &&
                (n1 || n1 === 0) &&
                (n2 || n2 === 0) &&
                (n3 || n3 === 0) &&
                (n4 || n4 === 0)))
                return ('Set all Infos');
            const getClass = (yield pgConnection_1.default.query(queries_1.default.verifyClass, [student_class])).rows[0];
            if (!getClass)
                return res.status(400).send('Non-existing class');
            const classStudentCount = (yield pgConnection_1.default.query(queries_1.default.getCountClass, [student_class])).rows[0].students_id;
            if (classStudentCount && classStudentCount.length === 35)
                return res.status(400).send('The class is at the limit of students');
            if (!(0, validators_1.emailValidator)(responsible_email, email)) {
                return res.status(400).send('Invalid Email(s)');
            }
            const verifyUserName = (yield pgConnection_1.default.query(queries_1.default.getUser_nameFromSocialMedia, [user_name])).rows[0];
            const verifyUserName2 = (yield pgConnection_1.default.query(queries_1.default.checkIfExistsUser_nameInSchool_teamDB, [user_name])).rows[0];
            const verifyEmail = (yield pgConnection_1.default.query(queries_1.default.getEmailFromSocialMedia, [email])).rows[0];
            const verifyResponsibleEmail = (yield pgConnection_1.default.query(queries_1.default.getResponsibleEmail, [responsible_email])).rows[0];
            if (verifyUserName || verifyUserName2 || verifyEmail)
                return res.status(400).send('Email or user name already exists');
            if (verifyResponsibleEmail)
                return res.status(400).send('The same responsible email is not allowed');
            if (bio && bio.length > 30)
                return res.status(400).send('bio > 30 not allowed');
            let whatIsError = 0; //If an error occurs when creating the student. Marking checkpoints...
            let rollbackClassAvarage = 0;
            try {
                try {
                    yield (0, validators_1.imgurValidate)(profile_photo);
                }
                catch (msg) {
                    return res.status(400).send(msg);
                }
                const salt = bcrypt_1.default.genSaltSync(10);
                const passEncrypted = bcrypt_1.default.hashSync(password, salt);
                yield pgConnection_1.default.query(queries_1.default.insertStudent, [name, responsible_email]);
                whatIsError++;
                const newStudentId = (yield pgConnection_1.default.query(queries_1.default.getNewStudentIdByEmail, [responsible_email])).rows[0].id;
                const media = ((n1 + n2 + n3 + n4 + n5) / 5).toFixed(2);
                let avarage;
                if (!getClass.avarage) {
                    avarage = Number(media);
                }
                else {
                    const promises = getClass.students_id.map((id) => __awaiter(this, void 0, void 0, function* () {
                        console.log(id);
                        const result = yield pgConnection_1.default.query(queries_1.default.studentGrade, [id]);
                        console.log(result.rows);
                        return result.rows[0].media;
                    }));
                    const grades = yield Promise.all(promises);
                    let classGradeSum = grades.reduce((sum, grade) => sum + grade, 0);
                    classGradeSum += Number(media);
                    avarage = classGradeSum / (getClass.students_id.length + 1);
                }
                const student_id = (yield pgConnection_1.default.query(queries_1.default.getNewStudentIdByEmail, [responsible_email])).rows[0].id;
                getClass.student_count ?
                    yield pgConnection_1.default.query(queries_1.default.updateClass, [student_class, avarage, student_id]) :
                    yield pgConnection_1.default.query(queries_1.default.updateClassFirstStudent, [student_class, avarage, student_id]);
                whatIsError++;
                yield pgConnection_1.default.query(queries_1.default.insertGrades, [newStudentId, n1, n2, n3, n4, n5, media]);
                whatIsError++;
                const verifyBio = bio === undefined ? null : bio;
                yield pgConnection_1.default.query(queries_1.default.insertSocial_Media, [newStudentId, user_name, email, passEncrypted, profile_photo, verifyBio]);
            }
            catch (error) {
                const newStudentId = (yield pgConnection_1.default.query(queries_1.default.getNewStudentIdByEmail, [responsible_email])).rows[0].id;
                if (whatIsError === 1) {
                    yield pgConnection_1.default.query(queries_1.default.deleteNewStudent, [newStudentId]);
                    console.log(error);
                    return res.status(500).send();
                }
                const student_id = (yield pgConnection_1.default.query(queries_1.default.getNewStudentIdByEmail, [responsible_email])).rows[0].id;
                const getNewArrayToUpdate = (yield pgConnection_1.default.query(queries_1.default.newArray, [student_id, student_class])).rows[0].array;
                const rollbackAvarage = rollbackClassAvarage / classStudentCount.length;
                if (whatIsError === 2) {
                    yield pgConnection_1.default.query(queries_1.default.updateClassBecauseError, [getClass.avarage, getNewArrayToUpdate, student_class]);
                    yield pgConnection_1.default.query(queries_1.default.deleteNewStudent, [newStudentId]);
                }
                if (whatIsError === 3) {
                    yield pgConnection_1.default.query(queries_1.default.updateClassBecauseError, [rollbackAvarage, getNewArrayToUpdate, student_class]);
                    yield pgConnection_1.default.query(queries_1.default.deleteNewGrades, [newStudentId]);
                    yield pgConnection_1.default.query(queries_1.default.deleteNewStudent, [newStudentId]);
                }
                console.log(error);
                return res.status(500).send();
            }
            ;
            return res.status(201).json('Student Created Successfully');
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { n1, n2, n3, n4, n5 } = req.body;
            if (Number.isNaN(Number(id)))
                return res.status(400).send('Only numbers are allowed');
            const office = req.token.payload.office;
            if (office !== 'director')
                return res.status(401).send('Only directors can change grades');
            if (!((n1 || n1 === 0) &&
                (n2 || n2 === 0) &&
                (n3 || n3 === 0) &&
                (n4 || n4 === 0)))
                return ('Set all grades to update');
            try {
                if (!((yield pgConnection_1.default.query(queries_1.default.getById, [id])).rows[0])) {
                    return res.status(400).send('Student not exists');
                }
                const newMedia = ((n1 + n2 + n3 + n4 + n5) / 5).toFixed(2);
                yield pgConnection_1.default.query(queries_1.default.updateGrades, [id, n1, n2, n3, n4, n5, newMedia]);
            }
            catch (err) {
                console.log(err);
                return res.status(500).send('Sorry, Internal Server Error :(');
            }
            return res.status(204).send();
        });
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const allInfos = (yield pgConnection_1.default.query(queries_1.default.getAll)).rows;
            return res.json(allInfos);
        });
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (Number.isNaN(Number(id)))
                return res.status(400).send('Only numbers are allowed');
            const student = (yield pgConnection_1.default.query(queries_1.default.getOneById, [id])).rows[0];
            if (!student)
                return res.status(400).send('Student not exists');
            return res.json(student);
        });
    }
    del(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { password } = req.body;
            if (Number.isNaN(Number(id)))
                return res.status(400).send('Only numbers are allowed');
            const office = req.token.payload.office;
            if (office !== 'director')
                return res.status(401).send('Just directors can delete a student');
            if (!password)
                return res.status(400).send('Set your password');
            const directorEmailInToken = req.token.payload.email;
            const passFromDB = (yield pgConnection_1.default.query(queries_1.default.getDirectorPass, [directorEmailInToken])).rows[0].password;
            if (!(bcrypt_1.default.compare(password, passFromDB))) {
                return res.status(401).send('Incorrect password');
            }
            const student = (yield pgConnection_1.default.query(queries_1.default.getStudentUser_name, [id])).rows[0];
            if (!student)
                return res.status(404).send();
            const getClass = (yield pgConnection_1.default.query(queries_1.default.getStudentClassById, [id])).rows[0];
            const students_idWithoutStudent = (yield pgConnection_1.default
                .query(queries_1.default.removeStudentOfTheArray, [id, getClass.name])).rows[0].array_remove;
            //Deleting - Performance promises
            try {
                yield Promise.all([
                    pgConnection_1.default.query(queries_1.default.deleteNewGrades, [id]),
                    pgConnection_1.default.query(queries_1.default.deleteStudentPhotos, [student.user_name]),
                    pgConnection_1.default.query(queries_1.default.deleteStudentFriendsTable, [student.user_name]),
                    pgConnection_1.default.query(queries_1.default.updateClassBecauseDelete, [getClass.name, students_idWithoutStudent])
                ]);
                if (!students_idWithoutStudent) {
                    yield pgConnection_1.default.query(queries_1.default.updateClassAvarage, [getClass.name, 0]);
                }
                else {
                    let classGradeSum = 0;
                    for (let i = 0; i < students_idWithoutStudent.length; i++) {
                        classGradeSum += (yield pgConnection_1.default.query(queries_1.default.studentGrade, [students_idWithoutStudent[i]])).rows[0].media;
                    }
                    const updatedAvarage = classGradeSum / students_idWithoutStudent.length;
                    yield pgConnection_1.default.query(queries_1.default.updateClassAvarage, [getClass.name, updatedAvarage]);
                }
                yield pgConnection_1.default.query(queries_1.default.deleteSocialMedia, [id]);
                yield pgConnection_1.default.query(queries_1.default.deleteById, [id]);
                return res.status(204).send();
            }
            catch (e) {
                console.log(e);
                return res.status(500).send();
            }
        });
    }
    createClass(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const office = req.token.payload.office;
            const { name } = req.body;
            if (office !== 'director')
                return res.status(401).send('Only directors can create a new class');
            if (name.length > 15)
                return res.status(400).send('Name up to 15 characters');
            let classesCount;
            try {
                yield pgConnection_1.default.query(queries_1.default.createNewClass, [name]);
                classesCount = ((yield pgConnection_1.default.query(queries_1.default.classesCount)).rowCount) || 1;
            }
            catch (e) {
                console.log(e);
                return res.status(500).send('Internal Server Error');
            }
            return res.status(201).json({
                name: name,
                classCount: classesCount
            });
        });
    }
    getClasses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const classes = (yield pgConnection_1.default.query(queries_1.default.getClasses)).rows;
            return res.json(classes);
        });
    }
    seePerfilByEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const studentPerfil = (yield pgConnection_1.default.query(queries_1.default.getStudentPerfil, [email])).rows[0];
            const teamPerfil = (yield pgConnection_1.default.query(queries_1.default.getTeamPerfil, [email])).rows[0];
            if (studentPerfil)
                return res.json(studentPerfil);
            if (teamPerfil) {
                return res.json(teamPerfil);
            }
            else {
                return res.status(404).send();
            }
        });
    }
}
;
exports.default = new StudentController();
