import { Request, Response } from "express";
import { CustomRequest } from "../../config/auth-validate/verifyJWT";
import Messages from "../../config/database/mongoose/models/Messages";
import { JwtPayload } from "jsonwebtoken";
import client from "../../config/database/pgConnection";

interface MessageType {
    profile: string;
    whoSent: string;
    message: string;
}

interface SeeMessage {
    whoSent: string
    message: string;
    received_in: string;
}

class MessageController {
    async create (req: Request, res: Response) {
        const requesterUser_name = ((req as CustomRequest).token as JwtPayload).payload.user_name;

        const { whoWillReceive, message } = req.body;
        if (!whoWillReceive || !message) return res.status(400).send('Set who will receive and the message');

        const [ findStudent, findTeam ] = await Promise.all([
            client.query('SELECT * FROM student_social_media WHERE user_name = $1', [whoWillReceive]),
            client.query('SELECT * FROM school_team WHERE user_name = $1', [whoWillReceive]),
        ]);
        if (!findStudent.rows[0] || !findTeam.rows[0]) return res.status(404).send();

        const newMessage: MessageType = {
            profile: whoWillReceive,
            whoSent: requesterUser_name,
            message: message
        }

        let error = false;
        await Messages.create(newMessage).then(() => error = error).catch(err => {
            error = true;
            console.log(err);
        });
        if(error) return res.status(500).send('Sorry, Internal Server Error');
        return res.status(201).send();
    }

    async see (req: Request, res: Response) {
        const profile = ((req as CustomRequest).token as JwtPayload).payload.user_name;

        let seeMessages: SeeMessage[] = [];
        (await Messages.find({profile: profile})).forEach((m, i) => {
            seeMessages[i] = {whoSent:m.whoSent ,message: m.message, received_in: m.received_in.toString()};
        });

        return res.json({seeMessages});
    }
}

export default new MessageController();