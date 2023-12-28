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
        
        const studentLog = (await client.query(queries.student, [email])).rows[0]; 
        const teamLog = (await client.query(queries.school_team, [email])).rows[0]; 

        if (!studentLog && !teamLog) {
            return res.status(400).send('Not founded');
        } 

        if (studentLog) { //ent mande o token de acesso para estudantes..

            if (password !== studentLog.password) {
                return res.status(401).send();
            } 

            // token = jwt.sign... manda aí, student n tem nd... é padrão... 


        } else if (teamLog) { 

            if (!(bcrypt.compareSync(password, teamLog.password))) {
                return res.status(401).send(`Incorrect password. Are you ${teamLog.office} "${teamLog.user_name}"?`);  
                //Ai tu cria uma parada, q se a pessoa errar a senha 3x, manda um 'forgetpass' ja sabe ne... Tá escrito lá, mt foda. Será uma rota obvio              
            }

            const payload = new Payload();
         
            if (teamLog.office === 'director') payload.office = 'director';
            if (teamLog.office === 'coordinator') payload.office = 'coordinator';
            if (teamLog.office === 'teacher') payload.office = 'teacher';
            payload.email = teamLog.email;
            payload.user_name = teamLog.user_name;
            
            const token = jwt.sign({payload}, AUTHSECRET, {expiresIn: '1d'}); 
            return res.json(token);
        }
    }
}

export default new Signin();
