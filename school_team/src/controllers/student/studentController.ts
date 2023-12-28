import { Request, Response } from "express";
import client from "../../config/database/pgConnection";
import queries from "./queries";
import { CustomRequest } from "../../config/auth-validate/verifyJWT";
import { JwtPayload } from "jsonwebtoken";
import axios from "axios";
import bcrypt from "bcrypt";
import { emailValidator } from "../../config/validators";

class StudentController {

    async create(req: Request, res: Response) {
        const { name, responsible_email, n1, n2, n3, n4, n5,
            user_name, email, password, profile_photo, bio } = req.body;

        if ((((req as CustomRequest).token as JwtPayload).payload.office) === 'teacher') {
            return res.status(401).send('Teachers are not allowed to insert someone. Just directors and coordinators.');
        }

        if (!name || !responsible_email || !n1 || !n2 || !n3 || !n4 || !n5
            || !user_name || !email || !password || !profile_photo) {
            return res.status(400).send('Set all infos');
        }

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

        try {

            // TODO Criar aquivo imgurVerify
            const imgurHost = new URL('', 'https://i.imgur.com/').hostname;
            const checkProfilePhoto = new URL('', profile_photo).hostname;

            if (imgurHost !== checkProfilePhoto) {
                return res.status(400).send("Only Imgur photos are allowed. Create a photo there if you don't have.")
            }

            const validateImage = await axios.get(profile_photo)
                .then(res => {
                    return res.status;
                }).catch(_ => false);

            if (!validateImage || validateImage === 404) {
                return res.status(400).send('Insert an existing photo from imgur.');
            }

            const salt = bcrypt.genSaltSync(10);
            const passEncrypted = bcrypt.hashSync(password, salt);


            await client.query(queries.insertStudent, [name, responsible_email]);

            //TODO alterar para email
            const newStudentId = (await client.query(queries.getNewStudentId)).rows[0].max;
            const media = ((n1 + n2 + n3 + n4 + n5) / 5).toFixed(2);
            whatIsError++;

            await client.query(queries.insertGrades, [newStudentId, n1, n2, n3, n4, n5, media]);
            whatIsError++;

            const verifyBio = bio === undefined ? null : bio;
            await client.query(queries.insertSocial_Media, [newStudentId, user_name, email, passEncrypted, profile_photo, verifyBio])

        } catch (error) {

            const newStudentId = (await client.query(queries.getNewStudentId)).rows[0].max;
            if (whatIsError === 1) {
                await client.query(queries.deleteNewStudent, [newStudentId]);
            }

            if (whatIsError === 2) {
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

    async getAll(req: Request, res: Response) { //any team school can this
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
        const { password } = req.body; //for more security

        const office = ((req as CustomRequest).token as JwtPayload).payload.office;
        if (office !== 'director') return res.status(401).send('Just directors can delete a student');

        if (!password) return res.status(400).send('Set your password');
        
        const directorEmailInToken = ((req as CustomRequest).token as JwtPayload).payload.email;
        
        const passFromDB = (await client.query(queries.getDirectorPass, [directorEmailInToken])).rows[0].password;

        if (!(bcrypt.compare(password, passFromDB))) {
            return res.status(401).send('Incorrect password');
        }

        //later use delete on multiple tables
        await client.query(queries.deleteNewGrades, [id]);
        await client.query(queries.deleteSocialMedia, [id]);
        await client.query(queries.deleteById, [id]);        

        return res.status(204).send();
    }
};

export default new StudentController();