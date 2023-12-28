import { Request, Response } from "express";
import client from "../../config/database/pgConnection";
import queries from "./queries";
import axios from "axios";
import bcrypt from 'bcrypt';
import { emailValidator } from "../../config/validators";
import { verifyJWT, CustomRequest } from "../../config/auth-validate/verifyJWT";
import { JwtPayload } from "jsonwebtoken";


class SchoolTeamController {
    async create (req: Request, res: Response) { //para q diretores e coordenadores criem teacher/coordenadores/diretoes. Para criar alunos, é lá no studentController!!
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

            await client.query(queries.insert, [user_name, office, profile_photo, email, passEncrypted]);

        } catch (err) {
            console.log(err)
            return res.status(500).send('Sorry, Internal Server Error');
        }

        return res.status(201).send();
    }
}

export default new SchoolTeamController();

/**
 * Bota o imgir valudate e a parada ai
 */