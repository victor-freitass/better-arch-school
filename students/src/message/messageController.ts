import { Request, Response } from "express";
import { CustomRequest } from "../config/auth-validate/verifyJWT";
import Message from "../config/database/mongooseModels/Messages";
import { JwtPayload } from "jsonwebtoken";
import client from "../config/database/pgConnection";
import queries from "./queries";

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
    async send (req: Request, res: Response) {
        const { whoWillReceive, message } = req.body;

        if (!whoWillReceive || !message) return res.status(400).send('Set who will receive and the message');

        const requesterUser_name = ((req as CustomRequest).token as JwtPayload).payload.user_name;

        const findUser_name = (await client.query(queries.getUserName, [whoWillReceive])).rows[0];
        if (!findUser_name) return res.status(404).send();

        const verifyIfIsTeam = (await client.query(queries.verifyIfIsTeam, [whoWillReceive])).rows[0];
        const friends = (await client.query(queries.verifyFriends, [requesterUser_name, whoWillReceive])).rows[0];
        if (!verifyIfIsTeam && !friends) return res.status(400).send("You are not friends. Send a friend request first.");
        
        const newMessage: MessageType = {
            profile: whoWillReceive,
            whoSent: requesterUser_name,
            message: message
        }

        await Message.create(newMessage);
        return res.status(201).send();
    }

    async see (req: Request, res: Response) {
        const profile = ((req as CustomRequest).token as JwtPayload).payload.user_name;

        let seeMessages: SeeMessage[] = [];
        (await Message.find({profile: profile})).forEach((m, i) => {
            seeMessages[i] = {whoSent:m.whoSent ,message: m.message, received_in: m.received_in.toString()};
        });

        return res.json({seeMessages});
    }
}

export default new MessageController();