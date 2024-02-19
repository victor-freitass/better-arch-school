import { Request, Response } from "express";
import client from "../../config/database/pgConnection";
import queries from "./queries";
import { CustomRequest } from "../../config/auth-validate/verifyJWT";
import { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { emailValidator, imgurValidate } from "../../config/validators";

class StudentController {

    async create(req: Request, res: Response) {
        const { name, responsible_email, n1, n2, n3, n4, n5, student_class, 
            user_name, email, password, profile_photo, bio } = req.body;

        if ((((req as CustomRequest).token as JwtPayload).payload.office) === 'teacher') {
            return res.status(401).send('Teachers are not allowed to insert someone. Just directors and coordinators.');
        }

        //to accept grades = 0, and verify all input
        if (
            !(
                name && responsible_email && student_class && user_name &&
                email && password && profile_photo &&
                (n1 || n1 === 0) &&
                (n2 || n2 === 0) &&
                (n3 || n3 === 0) &&
                (n4 || n4 === 0))
        ) return ('Set all Infos');

        const getClass = (await client.query(queries.verifyClass, [student_class])).rows[0];
        if (!getClass) return res.status(400).send('Non-existing class');

        const classStudentCount: number[] = (await client.query(queries.getCountClass, 
            [student_class])).rows[0].students_id;
        if (classStudentCount && classStudentCount.length === 35) return res.status(400).send('The class is at the limit of students');

        if (!emailValidator(responsible_email, email)) {
            return res.status(400).send('Invalid Email(s)');
        }

        const verifyUserName = (await client.query(queries.getUser_nameFromSocialMedia, [user_name])).rows[0];
        const verifyUserName2 = (await client.query(queries.checkIfExistsUser_nameInSchool_teamDB, 
            [user_name])).rows[0]
        const verifyEmail = (await client.query(queries.getEmailFromSocialMedia, [email])).rows[0];
        const verifyResponsibleEmail = (await client.query(queries.getResponsibleEmail, [responsible_email])).rows[0];

        if (verifyUserName || verifyUserName2 || verifyEmail) return res.status(400).send('Email or user name already exists');
        if (verifyResponsibleEmail) return res.status(400).send('The same responsible email is not allowed');
        if (bio && bio.length > 30) return res.status(400).send('bio > 30 not allowed');

        let whatIsError = 0; //If an error occurs when creating the student. Marking checkpoints...
        let rollbackClassAvarage = 0;

        try {

            try {
                await imgurValidate(profile_photo);
            } catch (msg) {
                return res.status(400).send(msg);
            }

            const salt = bcrypt.genSaltSync(10);
            const passEncrypted = bcrypt.hashSync(password, salt);

            await client.query(queries.insertStudent, [name, responsible_email]);
            whatIsError++;

            const newStudentId = (await client.query(queries.getNewStudentIdByEmail, 
                [responsible_email])).rows[0].id;
            const media = ((n1 + n2 + n3 + n4 + n5) / 5).toFixed(2);

            let avarage: number;
            if (!getClass.avarage) {
                avarage = Number(media);
            } else {
                const promises = getClass.students_id.map(async (id:number) => {
                    const result = await client.query(queries.studentGrade, [id]);
                    return result.rows[0].media;
                });
                
                const grades = await Promise.all(promises);
                let classGradeSum = grades.reduce((sum, grade) => sum + grade, 0);

                classGradeSum += Number(media);
                avarage = classGradeSum / (getClass.students_id.length + 1);
            }    

            const student_id = (await client.query(queries.getNewStudentIdByEmail, 
                [responsible_email])).rows[0].id;
    
            getClass.student_count ?  
            await client.query(queries.updateClass, [student_class, avarage, student_id]) :
            await client.query(queries.updateClassFirstStudent, [student_class, avarage, student_id]); 
            whatIsError++;

            await client.query(queries.insertGrades, [newStudentId, n1, n2, n3, n4, n5, media]);
            whatIsError++;

            const verifyBio = bio === undefined ? null : bio;
            await client.query(queries.insertSocial_Media, [newStudentId, user_name, email, passEncrypted, profile_photo, verifyBio]);

        } catch (error) {

            const newStudentId = (await client.query(queries.getNewStudentIdByEmail, 
                [responsible_email])).rows[0].id;

            if (whatIsError === 1) {
                await client.query(queries.deleteNewStudent, [newStudentId]);
                return res.status(500).send();
            }

            const student_id = (await client.query(queries.getNewStudentIdByEmail, 
                [responsible_email])).rows[0].id;
                
            const getNewArrayToUpdate = (await client.query(queries.newArray, 
                [student_id, student_class])).rows[0].array;

            const rollbackAvarage = rollbackClassAvarage / classStudentCount.length


            if(whatIsError === 2) { 
                await client.query(queries.updateClassBecauseError, 
                    [getClass.avarage, getNewArrayToUpdate, student_class]);
                await client.query(queries.deleteNewStudent, [newStudentId]);
            }

            if(whatIsError === 3) {
                await client.query(queries.updateClassBecauseError, 
                    [rollbackAvarage, getNewArrayToUpdate, student_class]);
                await client.query(queries.deleteNewGrades, [newStudentId]);
                await client.query(queries.deleteNewStudent, [newStudentId]);
            }

            console.log(error);
            return res.status(500).send();
        };

        return res.status(201).json('Student Created Successfully');
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const { n1, n2, n3, n4, n5 } = req.body;
        if (Number.isNaN(Number(id))) return res.status(400).send('Only numbers are allowed');
        
        const office = ((req as CustomRequest).token as JwtPayload).payload.office;
        if (office !== 'director') return res.status(401).send('Only directors can change grades');

        if (
            (typeof n1 === 'undefined' || n1 === null) ||
            (typeof n2 === 'undefined' || n2 === null) ||
            (typeof n3 === 'undefined' || n3 === null) ||
            (typeof n4 === 'undefined' || n4 === null) ||
            (typeof n5 === 'undefined' || n5 === null)
        ) return res.status(400).send('Set all values');

        if (
            typeof n1 !== 'number' || 
            typeof n2 !== 'number' || 
            typeof n3 !== 'number' ||
            typeof n4 !== 'number' ||
            typeof n5 !== 'number' 
        ) return res.status(400).send('Just numbers allowed');
        
        try {
            if (!((await client.query(queries.getById, [id])).rows[0])) {
                return res.status(404).send('Student not exists');
            }
            const newMedia = ((n1 + n2 + n3 + n4 + n5) / 5).toFixed(2);

            await client.query(queries.updateGrades, [id, n1, n2, n3, n4, n5, newMedia]);

            //update class avarage
            const getClass = (await client.query(queries.getStudentClassById, [id]))
                .rows[0];
            console.log(getClass);
            console.log(getClass.students_id.length);

            let classSum = 0;
            for (let student of getClass.students_id) {
                const studentGrade = (await client.query(queries.studentGrade, 
                    [student])).rows[0].media;
                classSum += studentGrade;
            }
            console.log(classSum)

            const newClassAvarage = classSum / getClass.students_id.length;
            await client.query(queries.updateClassAvarage, [getClass.name, newClassAvarage]);
        } catch (err) {
            console.log(err);
            return res.status(500).send('Sorry, Internal Server Error :(')
        }

        return res.status(204).send();
    }

    async getAll(req: Request, res: Response) { 
        const allInfos = (await client.query(queries.getAll)).rows;
        return res.json(allInfos);
    }

    async getById (req: Request, res: Response) {
        const { id } = req.params;
        if (Number.isNaN(Number(id))) return res.status(400).send('Only numbers are allowed');

        const student = (await client.query(queries.getOneById, [id])).rows[0];
        if(!student) return res.status(404).send();
        return res.json(student);
    }

    async del (req: Request, res: Response) {
        const { id } = req.params;
        const { password } = req.body;
        if (Number.isNaN(Number(id))) return res.status(400).send('Only numbers are allowed');

        const office = ((req as CustomRequest).token as JwtPayload).payload.office;
        if (office !== 'director') return res.status(401).send('Just directors can delete a student');

        if (!password) return res.status(400).send('Set your password');
        
        const directorEmailInToken = ((req as CustomRequest).token as JwtPayload).payload.email;
        
        const passFromDB = (await client.query(queries.getDirectorPass, [directorEmailInToken])).rows[0].password;

        if (!(bcrypt.compare(password, passFromDB))) {
            return res.status(401).send('Incorrect password');
        }

        const student = (await client.query(queries.getStudentUser_name, [id])).rows[0];
        if (!student) return res.status(404).send();

        const getClass = (await client.query(queries.getStudentClassById, [id])).rows[0];
        const students_idWithoutStudent = (await client
            .query(queries.removeStudentOfTheArray, [id, getClass.name])).rows[0].array_remove;
          
        //Deleting - Performance promises
        try {  
            await Promise.all([
                client.query(queries.deleteNewGrades, [id]), 
                client.query(queries.deleteStudentPhotos, [student.user_name]),
                client.query(queries.deleteStudentFriendsTable, [student.user_name]),
                client.query(queries.updateClassBecauseDelete, 
                    [getClass.name, students_idWithoutStudent])
            ]);

            if (!students_idWithoutStudent) {
                await client.query(queries.updateClassAvarage, [getClass.name, 0]);

            } else {
                let classGradeSum = 0;
                for (let i = 0; i < students_idWithoutStudent.length; i++) {
                    classGradeSum += (await client.query(queries.studentGrade,
                        [students_idWithoutStudent[i]])).rows[0].media;
                }

                const updatedAvarage = classGradeSum / students_idWithoutStudent.length;
                await client.query(queries.updateClassAvarage, [getClass.name, updatedAvarage]);
            }
            await client.query(queries.deleteSocialMedia, [id]);
            await client.query(queries.deleteById, [id]);

            return res.status(204).send();
        } catch (e) {
            console.log(e);
            return res.status(500).send();
        }
    }

    async createClass (req: Request, res: Response) {
        const office = ((req as CustomRequest).token as JwtPayload).payload.office;
        const { name } = req.body;
        
        if (office !== 'director') return res.status(401).send('Only directors can create a new class');
        if (name.length > 15) return res.status(400).send('Name up to 15 characters');
        
        const classExists = (await client.query(queries.getClassByName, [name])).rows[0];
        if (classExists) return res.status(400).send('This class already exists')

        let classesCount: number;
        try {
            await client.query(queries.createNewClass, [name]);
            classesCount = ((await client.query(queries.classesCount)).rowCount) || 1 ;
        } catch (e) {
            console.log(e);
            return res.status(500).send('Internal Server Error');
        }

        return res.status(201).json({
            name: name,
            classCount: classesCount
        })
    }

    async getClasses (req: Request, res: Response) {
        const classes = (await client.query(queries.getClasses)).rows;
        return res.json(classes);
    }

    async seePerfilByEmail (req: Request, res: Response) {
        const { email } = req.query;
        const studentPerfil = (await client.query(queries.getStudentPerfil, [email])).rows[0];
        const teamPerfil = (await client.query(queries.getTeamPerfil, [email])).rows[0];

        if (studentPerfil) return res.json(studentPerfil);
        if (teamPerfil) {
            return res.json(teamPerfil)
        } else {
            return res.status(404).send()
        }
    }
};

export default new StudentController();