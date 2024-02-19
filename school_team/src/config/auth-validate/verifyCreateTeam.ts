import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const authSecret = process.env.AUTHSECRET as string;
const AUTHSECRET:Secret = authSecret;

interface CustomRequest extends Request {
    token: string | JwtPayload | undefined;
}

function verifyJWTCreateTeam (req: Request, res: Response, next: NextFunction) {
    const { boss_password } = req.body;

    //verify boss/owner - initial director
    if (boss_password && boss_password !== process.env.BOSS_PASSWORD) {
        return res.status(401).send('Incorrect boss password');
    } else if (boss_password === process.env.BOSS_PASSWORD) {
        (req as CustomRequest).token = 'BOSS';
        return next();
    }

    let token: string | undefined; 

    const auth = (req.headers['auth']); //In Swagger 
    if(typeof auth === "string") {  
        token = auth.replace('Bearer ', ''); 
    } else {
        token = (req.headers['authorization']?.replace('Bearer ', ''));
    }

    let block = false;

    if(!token) {
        return res.status(401).send('Without Token');
    }

    jwt.verify(token, AUTHSECRET, (err, decoded) => {
        if (err) block = true;
        (req as CustomRequest).token = decoded;  
    });

    if (block) return res.status(401).send("You're not allowed.");
    next();
}

export { verifyJWTCreateTeam, CustomRequest };