import { Request, Response } from "express";
import client from "../database/pgConnection";
import queries from "./queries";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

type Payload = {
    email: string;
    student: boolean
    user_name: string
}

const AUTHSECRET = process.env.AUTHSECRET as string;

class Signin {
    async signin (req: Request, res: Response) {
        const { email, password } = req.body;

        if(!email || !password) return res.status(400).send('Insert email and password');

        const studentFromDB = (await client.query(queries.getStudent, [email])).rows[0];
        if (!studentFromDB) return res.status(400).send('Not founded');

        if(!bcrypt.compareSync(password, studentFromDB.password)) {
            return res.status(401).send(`Incorrect Password. Are you ${studentFromDB.user_name}?`);
        }

        const payload: Payload = {
            email: studentFromDB.email,
            student: true,
            user_name: studentFromDB.user_name
        }

        const token = jwt.sign({payload}, AUTHSECRET, {expiresIn: '1d'});
        return res.json(token);
    }
}

export default new Signin();