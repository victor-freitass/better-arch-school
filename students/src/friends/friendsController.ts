import { Request, Response } from "express";
import { CustomRequest } from "../config/auth-validate/verifyJWT";
import { JwtPayload } from "jsonwebtoken";
import client from "../config/database/pgConnection";
import queries from "./queries";

class FriendsController {
    async sendFriendRequest (req: Request, res: Response) {
        const requesterUser_name = ((req as CustomRequest).token as JwtPayload).payload.user_name;
        const { user_name: user_nameToRequestFriend } = req.body;

        if (!user_nameToRequestFriend) return res.status(400).send('Set user_name to friend request');

        const checkIfExists = (await client.query(queries.checkIfExists, 
            [user_nameToRequestFriend])).rows[0];
        if (!checkIfExists) return res.status(400).send('This student not exists');

        const alreadyAreFriends = (await client.query(queries.checkAlreadyFriends, 
            [requesterUser_name, user_nameToRequestFriend])).rows[0];
            if (alreadyAreFriends) return res.status(400).send('You are already friends');
            
        let block = 0;
        const iAlreadyDidRequestBefore = (await client.query(queries.getFriendRequests, 
            [user_nameToRequestFriend])).rows;
        if (iAlreadyDidRequestBefore[0].friend_requests) {
            iAlreadyDidRequestBefore[0].friend_requests.forEach((request: string) => {
                if (request === requesterUser_name) block = 1;
            });
        }

        const heAlreadyMadeBefore = (await client.query(queries.getFriendRequests, 
            [requesterUser_name])).rows;
            if (heAlreadyMadeBefore[0].friend_requests) {
                heAlreadyMadeBefore[0].friend_requests.forEach((request: string) => {
                    if (request === user_nameToRequestFriend) block = 2;
                });
            }
        
        if (block === 1) return res.status(400).send('Have you made this request before');
        if (block === 2) return res.status(400).send('He made the request to you before. Check your friend requests and accept.');

        await client.query(queries.sendFriendRequest, 
            [user_nameToRequestFriend, requesterUser_name]);
        
        return res.status(201).send(`Request send to ${user_nameToRequestFriend}!`);
    }

    async getAllRequests (req: Request, res: Response) {
        const requesterUser_name = ((req as CustomRequest).token as JwtPayload).payload.user_name;
        const requests = (await client.query(queries.getFriendRequests, [requesterUser_name])).rows;
        
        return res.json(requests[0].friend_requests || 'No requests now');
    }

    async getAllFriends (req: Request, res: Response) {
        const requesterUser_name = ((req as CustomRequest).token as JwtPayload).payload.user_name;
        const friends = (await client.query(queries.getAll, [requesterUser_name])).rows;

        let justTheFriends: string[] = [];

        friends.forEach(f => {
            if (f.student_one === requesterUser_name) {
                justTheFriends.push(f.student_two);
            } else {
                justTheFriends.push(f.student_one);
            }
        });

        return res.json({friends: justTheFriends});
    }

    async acceptRequest (req: Request, res: Response) {
        const requesterUser_name = ((req as CustomRequest).token as JwtPayload).payload.user_name;
        const { user_nameToRequestAccept } = req.body;

        const requests = (await client.query(queries.getFriendRequests, 
            [requesterUser_name])).rows[0].friend_requests;

        let thisReqExists = false;
        if (requests) {
            requests.forEach(async (user_name: string) => {
                if (user_name === user_nameToRequestAccept) {
                    thisReqExists = true;
                    await client.query(queries.removeRequest, 
                        [requesterUser_name, user_nameToRequestAccept]);
                    await client.query(queries.insert, [user_nameToRequestAccept, requesterUser_name]);
                }
            });
        } else {
            return res.status(400).send('No one pending request for you');
        }
        
        if (!thisReqExists) return res.status(400).send('This friend request not exists');
        return res.status(201).send('Request accepted');
    } 
}

export default new FriendsController();