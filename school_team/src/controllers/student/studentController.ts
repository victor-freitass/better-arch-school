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

        if (!name || !responsible_email || !n1 || !n2 || !n3 || !n4 || !n5
            || !student_class || !user_name || !email || !password || !profile_photo) {
            return res.status(400).send('Set all infos');
        }

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

        let whatIsError = 0;
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

            const newStudentId = (await client.query(queries.getNewStudentIdByEmail, 
                [responsible_email])).rows[0].id;
            const media = ((n1 + n2 + n3 + n4 + n5) / 5).toFixed(2);
            whatIsError++;

            let avarage: number;
            if (!getClass.avarage) {
                avarage = Number(media);
            } else {
                const studentsId = (await client.query(queries.getClassStudents, 
                    [student_class])).rows[0].students_id;

                let classStudentsMediaSum = 0;

                const promises = studentsId.map(async (id: number | string) => {
                    let result = await client.query(queries.getStudentMediaById, [id]);
                    classStudentsMediaSum += result.rows[0].media;
                });

                rollbackClassAvarage = classStudentsMediaSum;
                await Promise.all(promises);

                classStudentsMediaSum += Number(media); 
                avarage = Number((classStudentsMediaSum / (getClass.student_count + 1)).toFixed(2));
            }    

            const student_id = (await client.query(queries.getNewStudentIdByEmail, 
                [responsible_email])).rows[0].id;
    
            await client.query(queries.updateClass, [student_class, avarage, student_id]);
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
            }

            const student_id = (await client.query(queries.getNewStudentIdByEmail, 
                [responsible_email])).rows[0].id;
                
            const getNewArrayToUpdate = (await client.query(queries.newArray, 
                [student_id, student_class])).rows[0].array;

            const rollbackAvarage = rollbackClassAvarage / classStudentCount.length


            if(whatIsError === 2) {
                await client.query(queries.updateClassBecauseError, 
                    [rollbackAvarage, getNewArrayToUpdate, student_class]);
                await client.query(queries.deleteNewStudent, [newStudentId]);
            }

            if(whatIsError === 3) {
                await client.query(queries.updateClassBecauseError, 
                    [rollbackAvarage, getNewArrayToUpdate, student_class]);
                await client.query(queries.deleteNewGrades, [newStudentId]);
                await client.query(queries.deleteNewStudent, [newStudentId]);
            }

            console.log(error);
            return res.status(500).send('Sorry, Internal Server Error');
        };

        return res.status(201).json('Student Created Successfully');
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const { n1, n2, n3, n4, n5 } = req.body;

        const office = ((req as CustomRequest).token as JwtPayload).payload.office;
        if (office !== 'director') return res.status(401).send('Only directors can change grades');

        if (!n1 || !n2 || !n3 || !n4 || !n5) {
            return res.status(400).send('Set all the notes to update');
        }

        try {
            if (!((await client.query(queries.getById, [id])).rows[0])) {
                return res.status(400).send('Student not exists');
            }
            const newMedia = ((n1 + n2 + n3 + n4 + n5) / 5).toFixed(2);

            await client.query(queries.updateGrades, [id, n1, n2, n3, n4, n5, newMedia]);

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

        const student = (await client.query(queries.getOneById, [id])).rows[0];
        if(!student) return res.status(400).send('Student not exists');
        return res.json(student);
    }

    async del (req: Request, res: Response) {
        const { id } = req.params;
        const { password } = req.body;

        const office = ((req as CustomRequest).token as JwtPayload).payload.office;
        if (office !== 'director') return res.status(401).send('Just directors can delete a student');

        if (!password) return res.status(400).send('Set your password');
        
        const directorEmailInToken = ((req as CustomRequest).token as JwtPayload).payload.email;
        
        const passFromDB = (await client.query(queries.getDirectorPass, [directorEmailInToken])).rows[0].password;

        if (!(bcrypt.compare(password, passFromDB))) {
            return res.status(401).send('Incorrect password');
        }

        await client.query(queries.deleteNewGrades, [id]);
        await client.query(queries.deleteSocialMedia, [id]);
        await client.query(queries.deleteById, [id]);        

        return res.status(204).send();
    }

    async createClass (req: Request, res: Response) {
        const office = ((req as CustomRequest).token as JwtPayload).payload.office;
        const { name } = req.body;
        
        if (office !== 'director') return res.status(401).send('Only directors can create a new class');
        if (name.length > 15) return res.status(400).send('Name up to 15 characters') 

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
        const { email } = req.body;

        const studentPerfil = (await client.query(queries.getStudentPerfil, [email])).rows[0];
        const teamPerfil = (await client.query(queries.getTeamPerfil, [email])).rows[0];

        if(!studentPerfil.bio) delete studentPerfil.bio;
         
        return studentPerfil ? res.json(studentPerfil) : res.json(teamPerfil || 'Not found');
    }
};

export default new StudentController();