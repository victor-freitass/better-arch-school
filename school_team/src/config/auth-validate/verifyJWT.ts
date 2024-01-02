import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

const authSecret = process.env.AUTHSECRET as string;
const AUTHSECRET:Secret = authSecret;

interface CustomRequest extends Request {
    token: string | JwtPayload | undefined;
}

function verifyJWT (req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.replace('Bearer ', ''); 
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

export { verifyJWT, CustomRequest };