import { Request, Response } from "express";
import { CustomRequest } from "../config/auth-validate/verifyJWT";
import { JwtPayload } from "jsonwebtoken";
import imgurValidate from "../config/imgurValidate";
import client from "../config/database/pgConnection";
import queries from "./queries";

class PhotoController {
    async create (req: Request, res: Response) {
        const user_name = ((req as CustomRequest).token as JwtPayload).payload.user_name;
        const { url } = req.body;
        if (!url) return res.status(400).send('Set a url from imgur');
        
        try {
            await imgurValidate(url);
        } catch (msg) {
            return res.status(400).send(msg);
        }
        
        let error = false;
        client.query(queries.insert, [url, user_name], err => {
            if (err) error = true; 
        });
        
        if (error) return res.status(500).send('Sorry, internal server error');
        return res.status(201).send('Photo published successfully!');
    }

    async getAll (req: Request, res: Response) {
        const user_name = ((req as CustomRequest).token as JwtPayload).payload.user_name;
        const allPhotos = (await client.query(queries.getAll, [user_name])).rows;

        return res.json(allPhotos);
    }

    async deleteById (req: Request, res: Response) {
        const user_name = ((req as CustomRequest).token as JwtPayload).payload.user_name;
        const { id } = req.params;

        client.query(queries.delete, [id, user_name], err => {
            if (err) console.log(err)
        });
        return res.status(204).send();
    }

    async updateProfilePhoto (req: Request, res: Response) {
        const user_name = ((req as CustomRequest).token as JwtPayload).payload.user_name;
        const { url } = req.body;
        
        try {
            await imgurValidate(url);
        } catch (msg) {
            return res.status(400).send(msg);
        }

        client.query(queries.updateProfile, [url, user_name], err => {
            if (err) console.log(err);
        });
        return res.status(204).send('Profile photo updated successfully');
    }

}

export default new PhotoController();