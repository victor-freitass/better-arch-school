import { Request, Response } from "express";
import client from "../../config/database/pgConnection";
import queries from "./queries";
import axios from "axios";
import bcrypt from 'bcrypt';
import { emailValidator, imgurValidate } from "../../config/validators";
import { verifyJWT, CustomRequest } from "../../config/auth-validate/verifyJWT";
import { JwtPayload } from "jsonwebtoken";


class SchoolTeamController {
    async create (req: Request, res: Response) { 
        console.log('.')
        const { user_name, office, profile_photo, email, password } = req.body;
       
        try {

            const token = (req as CustomRequest).token;
            const officeValidate = (token as JwtPayload).payload.office;

            if (officeValidate === 'teacher') {
                return res.status(401).send('Teachers are not allowed to insert someone. Just directors and coordinators');
            }
                 
            if (!user_name || !office || !profile_photo || !email || !password) {
                return res.status(400).send('Set all infos');
            }
    
            if (office !== 'teacher' && office !== 'director' && office !== 'coordinator' ) {
                return res.status(400).send("Values Allowed: 'teacher' or 'coordinator' or 'director'");
            }

            const verifyEmail = (await client.query(queries.getEmailFromDB, [email])).rows[0];
            const verifyUserName = (await client.query(queries.getUser_nameFromDB, [user_name])).rows[0];
            const verifyUserName2 = (await client.query(queries.checkIfExistsUser_nameInStudentDB, [user_name])).rows[0]

            if (verifyEmail || verifyUserName2 || verifyUserName) return res.status(400).send('Email or user name already exists');
            
            if (!emailValidator(email)) return res.status(400).send('Invalid email');

            try {
                await imgurValidate(profile_photo);
            } catch (msg) {
                return res.status(400).send(msg);
            }
    
            const salt = bcrypt.genSaltSync(10);
            const passEncrypted = bcrypt.hashSync(password, salt);

            await client.query(queries.insert, [user_name, office, profile_photo, email, passEncrypted]);

        } catch (err) {
            console.log(err)
            return res.status(500).send('Sorry, Internal Server Error');
        }

        return res.status(201).send();
    }
}

export default new SchoolTeamController();
