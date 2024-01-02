import { Request, Response } from "express";
import client from "../database/pgConnection";
import queries from "./queries";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

class Payload { 
    office: string;
    email: string;
    user_name: string;
}

const AUTHSECRET = process.env.AUTHSECRET as string;

class Signin {
    async signin (req: Request, res: Response) {
        const { email, password } = req.body;
        
        const log = (await client.query(queries.school_team, [email])).rows[0]; 

        if (!log) {
            return res.status(400).send('Not founded');
        } 

        if (!(bcrypt.compareSync(password, log.password))) {
            return res.status(401).send(`Incorrect password. Are you ${log.office} "${log.user_name}"?`);
        }

        const payload = new Payload();

        if (log.office === 'director') payload.office = 'director';
        if (log.office === 'coordinator') payload.office = 'coordinator';
        if (log.office === 'teacher') payload.office = 'teacher';
        payload.email = log.email;
        payload.user_name = log.user_name;

        const token = jwt.sign({ payload }, AUTHSECRET, { expiresIn: '1d' });
        return res.json(token);
    }
}

export default new Signin();
