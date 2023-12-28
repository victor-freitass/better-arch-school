import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const AUTHSECRET = process.env.AUTHSECRET as string;

interface CustomRequest extends Request {
    token: string | JwtPayload | undefined;
}

function verifyJWT (req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization'] as string;
    let block = false;

    if (!token) return res.status(401).send('Without Token');

    jwt.verify(token, AUTHSECRET, (err, decoded) => {
        if (err) block = true;
        (req as CustomRequest).token = decoded;
    });

    if (block) return res.status(401).send('Invalid token');
    next();
}

export { verifyJWT, CustomRequest };